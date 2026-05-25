import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AuditoriaService } from '../../services/auditoria';
import { AdminUsuarios } from '../../services/admin-usuarios';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataViewModule, DataViewPageEvent } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatedResponse } from '@models/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, debounceTime, map, startWith, switchMap, tap } from 'rxjs';
import { MainContainer } from '@app/shared/components/main-container';
import { OnboardingService } from '@app/shared/services/onboarding.service';
import { ActivatedRoute } from '@angular/router';
import { Auditoria as AuditoriaModel } from '@models/auditoria';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    DataViewModule, 
    SkeletonModule, 
    TagModule, 
    DatePipe,
    MainContainer,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    FormsModule,
    TooltipModule
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Auditoria {
  protected auditService = inject(AuditoriaService);
  protected userService = inject(AdminUsuarios);
  private readonly onboarding = inject(OnboardingService);
  private readonly route = inject(ActivatedRoute);

  private tourPrompted = false;

  // Filtros
  protected readonly searchTerm = signal<string>('');
  protected readonly dateRange = signal<Date[] | null>(null);
  protected readonly selectedUserId = signal<string | null>(null);

  protected readonly logType = signal<"application" | "security">(
    this.route.snapshot.data["logType"] === "application" ? "application" : "security",
  );

  // Carga de usuarios para el filtro
  protected readonly usuarios = toSignal(
    this.userService.getUsers(1, 100).pipe(
      map(res => res.items.map(u => ({ label: u.username, value: u.id }))),
      startWith([])
    ),
    { initialValue: [] }
  );

  protected readonly title = computed(() =>
    this.logType() === "security" ? "Log de Seguridad OSI" : "Log de Aplicación",
  );
  
  protected readonly subtitle = computed(() =>
    this.logType() === "security"
      ? "Eventos de autenticación, 2FA y cambios de permisos."
      : "Eventos funcionales y operativos de la aplicación.",
  );

  protected isLoading = signal(true);
  protected paginationState = signal<DataViewPageEvent>({ first: 0, rows: 10 });

  private initialResponse: PaginatedResponse<AuditoriaModel> = {
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0,
  };

  private auditoriaResponse$ = combineLatest([
    toObservable(this.paginationState),
    toObservable(this.searchTerm).pipe(debounceTime(400)),
    toObservable(this.dateRange),
    toObservable(this.selectedUserId),
    toObservable(this.logType)
  ]).pipe(
    tap(() => this.isLoading.set(true)),
    switchMap(([state, search, dates, userId, type]) => {
      let dateFrom: string | undefined;
      let dateTo: string | undefined;
      
      if (dates && dates[0]) {
        dateFrom = dates[0].toISOString().split('T')[0];
      }
      if (dates && dates[1]) {
        dateTo = dates[1].toISOString().split('T')[0];
      }

      return this.auditService.getAuditLogs(
        state.first / state.rows + 1,
        state.rows,
        type,
        {
          search: search || undefined,
          dateFrom,
          dateTo,
          userId: userId ? Number(userId) : undefined
        }
      );
    }),
    tap(() => this.isLoading.set(false)),
    startWith(this.initialResponse)
  );

  protected auditoriaResponse = toSignal(this.auditoriaResponse$, {
    initialValue: this.initialResponse,
  });

  constructor() {
    if (!this.tourPrompted) {
      this.tourPrompted = true;
      afterNextRender(() => {
        this.onboarding.startTourIfFirstVisit('admin-auditoria-lista');
      });
    }
  }

  protected auditorias = computed(() => this.auditoriaResponse().items);
  protected totalRecords = computed(() => this.auditoriaResponse().total);
  protected first = computed(() => this.paginationState().first);
  protected rows = computed(() => this.paginationState().rows);

  protected onPageChange(event: DataViewPageEvent) {
    this.paginationState.set(event);
  }

  protected updateSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  protected onDateChange(dates: Date[] | null) {
    this.dateRange.set(dates);
  }

  protected onUserChange(userId: string | null) {
    this.selectedUserId.set(userId);
  }

  protected clearFilters() {
    this.searchTerm.set('');
    this.dateRange.set(null);
    this.selectedUserId.set(null);
  }

  protected getSeverity(event: string): 'success' | 'info' | 'warn' | 'danger' {
    if (event.includes('login_exitoso')) return 'success';
    if (event.includes('login_fallido')) return 'danger';
    if (event.includes('created')) return 'info';
    if (event.includes('deleted')) return 'warn';
    return 'info';
  }

  protected startGuidedTour(): void {
    this.onboarding.startTour('admin-auditoria-lista');
  }
}

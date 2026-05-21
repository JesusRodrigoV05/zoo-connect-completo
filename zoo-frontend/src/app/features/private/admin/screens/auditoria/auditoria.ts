import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AuditoriaService } from '../../services/auditoria';
import { DatePipe } from '@angular/common';
import { DataViewModule, DataViewPageEvent } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { PaginatedResponse } from '@models/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { startWith, switchMap, tap } from 'rxjs';
import { MainContainer } from '@app/shared/components/main-container';
import { ButtonModule } from 'primeng/button';
import { OnboardingService } from '@app/shared/services/onboarding.service';
import { ActivatedRoute } from '@angular/router';
import { Auditoria as AuditoriaModel } from '@models/auditoria';

@Component({
  selector: 'app-auditoria',
  imports: [
    DataViewModule, 
    SkeletonModule, 
    TagModule, 
    DatePipe,
    MainContainer,
    ButtonModule,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Auditoria {
  protected auditService = inject(AuditoriaService);
  private readonly onboarding = inject(OnboardingService);
  private readonly route = inject(ActivatedRoute);
  private tourPrompted = false;
  protected readonly logType = signal<"application" | "security">(
    this.route.snapshot.data["logType"] === "application" ? "application" : "security",
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

  private auditoriaResponse$ = toObservable(this.paginationState).pipe(
    tap(() => this.isLoading.set(true)),
    switchMap((state) =>
      this.auditService.getAuditLogs(
        state.first / state.rows + 1,
        state.rows,
        this.logType(),
      )
    ),
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

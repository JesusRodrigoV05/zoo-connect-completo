import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuditoriaService } from '../../services/auditoria';
import { AsyncPipe, DatePipe } from '@angular/common';
import { DataViewModule, DataViewLazyLoadEvent, DataViewPageEvent } from 'primeng/dataview';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { PaginatedResponse } from '@models/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { startWith, switchMap, tap } from 'rxjs';
import { MainContainer } from '@app/shared/components/main-container';

@Component({
  selector: 'app-auditoria',
  imports: [
    DataViewModule, 
    SkeletonModule, 
    TagModule, 
    DatePipe,
    MainContainer
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Auditoria {
  protected auditService = inject(AuditoriaService);

  protected isLoading = signal(true);
  protected paginationState = signal<DataViewPageEvent>({ first: 0, rows: 10 });

  private initialResponse: PaginatedResponse<Auditoria> = {
    items: [],
    total: 0,
    page: 1,
    size: 10,
    pages: 0,
  };

  private auditoriaResponse$ = toObservable(this.paginationState).pipe(
    tap(() => this.isLoading.set(true)),
    switchMap((state) =>
      this.auditService.getAuditLogs(state.first / state.rows + 1, state.rows)
    ),
    tap(() => this.isLoading.set(false)),
    startWith(this.initialResponse)
  );

  protected auditoriaResponse = toSignal(this.auditoriaResponse$, {
    initialValue: this.initialResponse,
  });

  protected auditorias = computed(() => this.auditoriaResponse().items);
  protected totalRecords = computed(() => this.auditoriaResponse().total);
  protected first = computed(() => this.paginationState().first);
  protected rows = computed(() => this.paginationState().rows);

  protected onPageChange(event: DataViewPageEvent) {
    this.paginationState.set(event);
  }

  protected getSeverity(event: string): 'success' | 'info' | 'warn' | 'danger' {
    if (event.includes('LOGIN_SUCCESS')) return 'success';
    if (event.includes('LOGIN_FAILED')) return 'danger';
    if (event.includes('CREATE')) return 'info';
    if (event.includes('DELETE')) return 'warn';
    return 'info';
  }
}

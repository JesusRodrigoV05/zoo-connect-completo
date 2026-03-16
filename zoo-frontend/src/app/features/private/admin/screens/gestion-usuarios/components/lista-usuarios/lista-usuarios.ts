import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import { Loader } from "@app/shared/components";
import { DataView, DataViewPageEvent } from "primeng/dataview";
import { ButtonModule } from "primeng/button";
import { RouterLink } from "@angular/router";
import { UsuarioItem } from "../usuario-item";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { PaginatedResponse } from "@models/common";
import { Usuario } from "@models/usuario";
import { AuthStore } from "@stores/auth.store";
import { AdminUsuarios } from "@app/features/private/admin/services/admin-usuarios";

@Component({
  selector: "zoo-lista-usuarios",
  imports: [Loader, DataView, ButtonModule, UsuarioItem, RouterLink],
  templateUrl: "./lista-usuarios.html",
  styleUrl: "../../../lista-styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListaUsuarios {
  private usuariosService = inject(AdminUsuarios);
  private readonly authStore = inject(AuthStore);
  private destroyRef = inject(DestroyRef);

  protected currentPage = signal(1);
  protected pageSize = signal(10);

  protected userData = signal<PaginatedResponse<Usuario> | null>(null);
  protected loading = signal<boolean>(true);
  protected error = signal<string | null>(null);
  protected loggedInUserId = computed(() => this.authStore.userId());
  protected isAuthLoading = computed(() => this.authStore.loading());

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const size = this.pageSize();

      this.loadUsers(page, size);
    });
  }

  protected loadUsers(page: number, size: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.usuariosService
      .getAllUsers(page, size)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.userData.set(response);
        },
        error: (err) => {
          console.error("Error al cargar usuarios:", err);
          this.error.set(
            err.message || "Ocurrió un error al cargar los usuarios.",
          );
          this.userData.set(null);
        },
      });
  }

  protected onPageChange(event: DataViewPageEvent): void {
    const nextPage = event.first / event.rows + 1;

    if (nextPage !== this.currentPage()) {
      this.currentPage.set(nextPage);
    }
    if (event.rows !== this.pageSize()) {
      this.pageSize.set(event.rows);
    }
  }
}

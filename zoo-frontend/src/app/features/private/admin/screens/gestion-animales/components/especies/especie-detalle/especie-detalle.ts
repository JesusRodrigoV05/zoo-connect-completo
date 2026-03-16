import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { AdminEspecies } from "@app/features/private/admin/services/admin-especies";
import { Loader } from "@app/shared/components";
import { Especie } from "@models/animales";
import { TagModule } from "primeng/tag";
import { finalize } from "rxjs";

@Component({
  selector: "zoo-especie-detalle",
  imports: [Loader, TagModule],
  templateUrl: "./especie-detalle.html",
  styleUrl: "./especie-detalle.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EspecieDetalle {
  public readonly especieId = input.required<number>();

  private readonly especiesService = inject(AdminEspecies);

  protected readonly especie = signal<Especie | null>(null);
  protected readonly loading = signal<boolean>(false);

  constructor() {
    effect(() => {
      const id = this.especieId();
      if (id) {
        this.loadEspecie(id);
      }
    });
  }

  private loadEspecie(id: number): void {
    this.loading.set(true);
    this.especie.set(null);

    this.especiesService
      .getSpeciesById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.especie.set(data),
        error: (err) =>
          console.error("Error al cargar detalle de especie", err),
      });
  }
}

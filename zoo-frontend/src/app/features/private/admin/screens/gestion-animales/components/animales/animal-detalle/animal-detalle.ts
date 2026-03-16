import { AnimalAdapter } from "@adapters/animales";
import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { Loader } from "@app/shared/components";
import { Animal } from "@models/animales";
import { TagModule } from "primeng/tag";
import { finalize } from "rxjs";

@Component({
  selector: "zoo-animal-detalle",
  imports: [Loader, TagModule, DatePipe],
  templateUrl: "./animal-detalle.html",
  styleUrl: "./animal-detalle.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalDetalle {
  public readonly animalId = input.required<number>();

  private readonly animalService = inject(AdminAnimales);

  protected readonly animal = signal<Animal | null>(null);
  protected readonly loading = signal<boolean>(false);

  protected readonly generoTexto = computed(() => {
    const animal = this.animal();
    return animal ? AnimalAdapter.getGeneroTexto(animal.genero) : "";
  });

  protected readonly estadoSeverity = computed(() => {
    const animal = this.animal();
    if (!animal) return "info";
    const color = AnimalAdapter.getEstadoColor(animal.estado_operativo);
    const severityMap: Record<
      string,
      "success" | "info" | "warn" | "secondary" | "danger" | "contrast"
    > = {
      success: "success",
      info: "info",
      warn: "warn",
      secondary: "secondary",
      danger: "danger",
      contrast: "contrast",
    };
    return severityMap[color] || "secondary";
  });

  constructor() {
    effect(() => {
      const id = this.animalId();
      if (id) {
        this.loadAnimal(id);
      }
    });
  }

  private loadAnimal(id: number): void {
    this.loading.set(true);
    this.animal.set(null);

    this.animalService
      .getAnimalById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.animal.set(data),
        error: (err) => console.error("Error al cargar detalle de animal", err),
      });
  }
}

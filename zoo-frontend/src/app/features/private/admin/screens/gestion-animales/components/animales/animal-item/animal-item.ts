import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  output,
} from "@angular/core";
import { Animal } from "@models/animales";
import { AnimalAdapter } from "@adapters/animales";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { DividerModule } from "primeng/divider";
import { ImageModule } from "primeng/image";
import { TooltipModule } from "primeng/tooltip";
import { RouterLink } from "@angular/router";

@Component({
  selector: "zoo-animal-item",
  imports: [CardModule, ButtonModule, TagModule, TooltipModule, RouterLink],
  templateUrl: "./animal-item.html",
  styleUrl: "./animal-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalItem {
  readonly animal = input.required<Animal>();

  readonly onDetails = output<number>();
  readonly onDelete = output<number>();

  readonly generoInfo = computed(() => {
    return this.animal().genero
      ? { label: "Macho", icon: "pi pi-mars", severity: "info" as const }
      : { label: "Hembra", icon: "pi pi-venus", severity: "danger" as const };
  });

  protected verDetalles(): void {
    this.onDetails.emit(this.animal().id_animal);
  }

  protected eliminar(): void {
    this.onDelete.emit(this.animal().id_animal);
  }
}

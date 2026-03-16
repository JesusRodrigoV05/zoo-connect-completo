import { NgClass, DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
  inject,
  Signal,
} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { Dieta } from "../../../models/alimentacion.model";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { AdminEspecies } from "@app/features/private/admin/services/admin-especies";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { catchError, map, of, startWith, switchMap } from "rxjs";
import { CardModule } from "primeng/card";
import { ZooItemActionButton } from "@app/shared/components/ui/zoo-item-action-button";

interface TargetInfo {
  type: string;
  name: string;
  icon: string;
  loading: boolean;
}

@Component({
  selector: "zoo-dieta-item",
  imports: [
    NgClass,
    ZooItemActionButton,
    TagModule,
    TooltipModule,
    DatePipe,
    CardModule,
  ],
  templateUrl: "./dieta-item.html",
  styleUrl: "./dieta-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DietaItem {
  private animalService = inject(AdminAnimales);
  private especieService = inject(AdminEspecies);

  readonly dieta = input.required<Dieta>();
  readonly layout = input.required<"list" | "grid">();

  readonly onEdit = output<number>();
  readonly onDelete = output<number>();
  readonly onView = output<number>();

  private dieta$ = toObservable(this.dieta);

  private targetInfo$ = this.dieta$.pipe(
    switchMap((d) => {
      if (d.animalId) {
        return this.animalService.getAnimalById(d.animalId).pipe(
          map((animal) => ({
            type: "Animal",
            name: animal.nombre,
            icon: "pi pi-heart",
            loading: false,
          })),
        );
      } else if (d.especieId) {
        return this.especieService.getSpeciesById(d.especieId).pipe(
          map((especie) => ({
            type: "Especie",
            name: especie.nombreComun,
            icon: "pi pi-users",
            loading: false,
          })),
        );
      }

      return of({
        type: "General",
        name: "Sin asignar",
        icon: "pi pi-question",
        loading: false,
      });
    }),
    catchError(() =>
      of({
        type: "Error",
        name: "No encontrado",
        icon: "pi pi-exclamation-circle",
        loading: false,
      }),
    ),
    startWith({
      type: "Cargando...",
      name: "",
      icon: "pi pi-spin pi-spinner",
      loading: true,
    }),
  );

  readonly targetInfo: Signal<TargetInfo> = toSignal(this.targetInfo$, {
    initialValue: {
      type: "Iniciando...",
      name: "",
      icon: "pi pi-spin pi-spinner",
      loading: true,
    },
  });

  readonly ingredientesCount = computed(() => this.dieta().detalles.length);
}

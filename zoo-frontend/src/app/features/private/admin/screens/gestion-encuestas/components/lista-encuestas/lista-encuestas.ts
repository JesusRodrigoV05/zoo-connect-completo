import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AdminEncuestas } from "@app/features/private/admin/services/admin-encuestas";
import { Loader } from "@app/shared/components";
import { DataView } from "primeng/dataview";
import { EncuestaItem } from "../encuesta-item";
import { ButtonModule } from "primeng/button";
import { Router, RouterLink } from "@angular/router";
import { Encuesta } from "@models/encuestas";
import { ConfirmationService } from "primeng/api";
import { ConfirmPopupModule } from "primeng/confirmpopup";
import { ShowToast } from "@app/shared/services";
import { Observable } from "rxjs";

@Component({
  selector: "zoo-lista-encuestas",
  imports: [
    AsyncPipe,
    Loader,
    DataView,
    ButtonModule,
    EncuestaItem,
    RouterLink,
    ConfirmPopupModule,
  ],
  providers: [ConfirmationService],
  templateUrl: "./lista-encuestas.html",
  styleUrl: "./lista-encuestas.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListaEncuestas {
  private surveyService = inject(AdminEncuestas);
  router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  protected surveys$!: Observable<Encuesta[]>;

  ngOnInit(): void {
    this.loadSurveys();
  }

  private loadSurveys(): void {
    this.surveys$ = this.surveyService.getAllSurveys();
  }
  private zooToast = inject(ShowToast);

  protected handleEdit(encuesta: Encuesta): void {
    this.router.navigate(["/admin/encuestas/editar", encuesta.idEncuesta]);
  }

  protected handleView(encuesta: Encuesta): void {
    this.router.navigate(["/admin/encuestas/stats", encuesta.idEncuesta]);
  }

  protected handleDelete(id: number): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la encuesta `,
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: "Cancelar",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: { label: "Eliminar", severity: "danger" },
      accept: () => {
        this.surveyService.deleteSurvey(id).subscribe({
          next: () => {
            this.zooToast.showSuccess("Éxito", "Encuesta eliminada");
            this.loadSurveys();
          },
          error: (err) => {
            this.zooToast.showError("Error", err.message);
          },
        });
      },
    });
  }
}

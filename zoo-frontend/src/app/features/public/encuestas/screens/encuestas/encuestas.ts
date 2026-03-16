import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MainContainer } from "@app/shared/components/main-container";
import { SkeletonModule } from "primeng/skeleton";
import { EncuestaService } from "../../services/encuestas";
import { EncuestaItem } from "./components/encuesta-item/encuesta-item";

@Component({
  selector: "app-encuestas",
  imports: [AsyncPipe, MainContainer, SkeletonModule, EncuestaItem],
  templateUrl: "./encuestas.html",
  styleUrl: "./encuestas.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Encuestas {
  private surveyService = inject(EncuestaService);
  protected surveys$ = this.surveyService.getSurveys();
}

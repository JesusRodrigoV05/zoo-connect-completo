import { AsyncPipe } from "@angular/common";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
} from "@angular/core";
import { MainContainer } from "@app/shared/components/main-container";
import { SkeletonModule } from "primeng/skeleton";
import { EncuestaService } from "../../services/encuestas";
import { EncuestaItem } from "./components/encuesta-item/encuesta-item";
import { ButtonModule } from "primeng/button";
import { OnboardingService } from "@app/shared/services/onboarding.service";

@Component({
  selector: "app-encuestas",
  imports: [
    AsyncPipe,
    MainContainer,
    SkeletonModule,
    EncuestaItem,
    ButtonModule,
  ],
  templateUrl: "./encuestas.html",
  styleUrl: "./encuestas.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Encuestas {
  private surveyService = inject(EncuestaService);
  private readonly onboarding = inject(OnboardingService);
  protected surveys$ = this.surveyService.getSurveys();

  constructor() {
    afterNextRender(() => {
      this.onboarding.startTourIfFirstVisit("public-encuestas");
    });
  }

  protected startGuidedTour(): void {
    this.onboarding.startTour("public-encuestas");
  }
}

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
} from "@angular/core";
import { OurStory } from "./components/our-story";
import { MisionVision } from "./components/mision-vision";
import { OnboardingService } from "@app/shared/services/onboarding.service";

@Component({
  selector: "app-about",
  imports: [OurStory, MisionVision],
  templateUrl: "./about.html",
  styleUrl: "./about.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class About {
  private readonly onboarding = inject(OnboardingService);

  constructor() {
    afterNextRender(() => {
      this.onboarding.startTourIfFirstVisit("public-acerca-de");
    });
  }
}

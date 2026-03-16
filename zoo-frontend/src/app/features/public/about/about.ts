import { ChangeDetectionStrategy, Component } from "@angular/core";
import { OurStory } from "./components/our-story";
import { MainContainer } from "@app/shared/components/main-container";
import { MisionVision } from "./components/mision-vision";

@Component({
  selector: "app-about",
  imports: [OurStory, MisionVision],
  templateUrl: "./about.html",
  styleUrl: "./about.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class About {}

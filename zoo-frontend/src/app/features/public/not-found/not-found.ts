import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MainContainer } from "@app/shared/components/main-container";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-not-found",
  imports: [ButtonModule, RouterLink, MainContainer],
  templateUrl: "./not-found.html",
  styleUrl: "./not-found.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotFound {}

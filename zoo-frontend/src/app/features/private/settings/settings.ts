import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import AjustesNav from "./components/ajustes-nav";
import { SplitterLayout } from "@core/layout/splitter-layout";

@Component({
  selector: "zoo-settings",
  imports: [SplitterLayout, AjustesNav, RouterOutlet],
  templateUrl: "./settings.html",
  styleUrls: ["./settings.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsComponent {}

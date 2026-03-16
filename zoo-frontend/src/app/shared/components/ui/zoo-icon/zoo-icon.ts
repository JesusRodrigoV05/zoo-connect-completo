import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
} from "@angular/core";
import {
  BoxIconAnimation,
  BoxIconBorder,
  BoxIconFlip,
  BoxIconPull,
  BoxIconRotate,
  BoxIconSize,
  BoxIconType,
} from "./zoo-icon.types";

@Component({
  selector: "zoo-icon",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./zoo-icon.html",
  styleUrl: "./zoo-icon.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZooIcon {
  name = input.required();
  color = input();
  type = input<BoxIconType>();
  size = input<BoxIconSize>("md");
  rotate = input<BoxIconRotate>();
  flip = input<BoxIconFlip>();
  border = input<BoxIconBorder>();
  animation = input<BoxIconAnimation>();
  pull = input<BoxIconPull>();
}

export type BoxIconType = "regular" | "solid" | "logo";
export type BoxIconSize = "xs" | "sm" | "md" | "lg" | string;
export type BoxIconRotate = 90 | 180 | 270;
export type BoxIconFlip = "horizontal" | "vertical";
export type BoxIconBorder = "square" | "circle";
export type BoxIconAnimation =
  | "spin"
  | "tada"
  | "flashing"
  | "burst"
  | "fade-left"
  | "fade-right"
  | "fade-up"
  | "fade-down"
  | "spin-hover"
  | "tada-hover"
  | "flashing-hover"
  | "burst-hover"
  | "fade-left-hover"
  | "fade-right-hover"
  | "fade-up-hover"
  | "fade-down-hover"
  | string;
export type BoxIconPull = "left" | "right";

export interface BoxIconAttributes {
  type?: BoxIconType;
  name: string;
  color?: string;
  size?: BoxIconSize;
  rotate?: BoxIconRotate;
  flip?: BoxIconFlip;
  border?: BoxIconBorder;
  animation?: BoxIconAnimation;
  pull?: BoxIconPull;
}

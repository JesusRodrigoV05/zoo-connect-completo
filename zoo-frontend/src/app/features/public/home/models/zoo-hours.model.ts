export type ZooState = "open" | "closed" | "closing-soon" | "opening-soon";

export interface ZooStatus {
  state: ZooState;
  message: string;
  subMessage: string;
  colorClass: string;
}

import { Type } from "@angular/core";

export interface CardData {
  src: string;
  title: string;
  category: string;
  content?: Type<any>;
  description?: string;
}

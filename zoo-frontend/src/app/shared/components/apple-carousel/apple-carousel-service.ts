import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AppleCarouselService {
  readonly currentIndex = signal(0);
  readonly cardClose = new Subject<number>();

  onCardClose(index: number): void {
    this.cardClose.next(index);
  }
}

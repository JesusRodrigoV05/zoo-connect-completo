import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  input,
  Renderer2,
  signal,
} from "@angular/core";
import { ClickOutside } from "@directive/click-outside";
import { NgComponentOutlet } from "@angular/common";
import { BlurImage } from "../blur-image";
import { AppleCarouselService } from "../apple-carousel-service";
import { CardData } from "../card-data.model";

@Component({
  selector: "app-card",
  imports: [ClickOutside, BlurImage, NgComponentOutlet],
  templateUrl: "./card.html",
  styleUrl: "./card.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[style.animation-delay.s]": "index() * 0.2",
    "(document:keydown.escape)": "onEscapeKey()",
  },
})
export class Card {
  carouselService = inject(AppleCarouselService);
  renderer = inject(Renderer2);
  document = inject(DOCUMENT);
  destroyRef = inject(DestroyRef);

  card = input.required<CardData>();
  index = input.required<number>();
  isOpen = signal(false);

  constructor() {
    effect(() => {
      const bodyOverflow = this.isOpen() ? "hidden" : "auto";
      this.renderer.setStyle(this.document.body, "overflow", bodyOverflow);
    });
  }

  handleOpen(): void {
    this.isOpen.set(true);
  }

  handleClose(): void {
    this.isOpen.set(false);
    this.carouselService.onCardClose(this.index());
  }

  onEscapeKey(): void {
    if (this.isOpen()) {
      this.handleClose();
    }
  }
}

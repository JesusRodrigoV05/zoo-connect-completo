import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NgClass } from "@angular/common";

@Component({
  selector: "zoo-3d-card",
  imports: [NgClass],
  templateUrl: "./card3d.html",
  styleUrl: "./card3d.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Zoo3DCard {
  readonly containerClass = input<string>("");
  readonly className = input<string>("");

  protected readonly cardRef = viewChild<ElementRef>("cardElement");
  protected readonly cardTitleRef = viewChild<ElementRef>("cardTitle");
  protected readonly cardDescriptionRef =
    viewChild<ElementRef>("cardDescription");
  protected readonly cardImageRef = viewChild<ElementRef>("cardImage");
  protected readonly cardActionsRef = viewChild<ElementRef>("cardActions");

  readonly isMouseEntered = signal(false);

  onMouseEnter(event: MouseEvent): void {
    this.isMouseEntered.set(true);

    const elements = [
      this.cardTitleRef()?.nativeElement,
      this.cardDescriptionRef()?.nativeElement,
      this.cardImageRef()?.nativeElement,
      this.cardActionsRef()?.nativeElement,
    ].filter(Boolean);

    elements.forEach((element: HTMLElement) => {
      element.style.transition =
        "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      element.style.transform = `translateZ(80px) scale(1.08)`;
    });
  }

  onMouseLeave(event: MouseEvent): void {
    const cardElement = this.cardRef()?.nativeElement;
    if (cardElement) {
      cardElement.style.transform = "rotateY(0deg) rotateX(0deg)";
    }

    const elements = [
      this.cardTitleRef()?.nativeElement,
      this.cardDescriptionRef()?.nativeElement,
      this.cardImageRef()?.nativeElement,
      this.cardActionsRef()?.nativeElement,
    ].filter(Boolean);

    elements.forEach((element: HTMLElement) => {
      element.style.transition =
        "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      element.style.transform = "translateZ(0px) scale(1)";
    });

    this.isMouseEntered.set(false);
  }

  onMouseMove(event: MouseEvent): void {
    const cardElement = this.cardRef()?.nativeElement;
    if (!cardElement) return;

    const rect = cardElement.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / 6;
    const y = (event.clientY - rect.top - rect.height / 2) / 6;

    const maxRotation = 35;
    const clampedX = Math.max(-maxRotation, Math.min(maxRotation, x));
    const clampedY = Math.max(-maxRotation, Math.min(maxRotation, y));

    cardElement.style.transform = `rotateY(${clampedX}deg) rotateX(${clampedY}deg)`;
  }
}

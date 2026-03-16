import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  Renderer2,
  signal,
  viewChild,
} from "@angular/core";
import { AppleCarouselService } from "./apple-carousel-service";
import { CardData } from "./card-data.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-apple-carousel",
  imports: [],
  templateUrl: "./apple-carousel.html",
  styleUrl: "./apple-carousel.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AppleCarouselService],
})
export class AppleCarousel {
  carouselService = inject(AppleCarouselService);
  platformId = inject(PLATFORM_ID);
  destroyRef = inject(DestroyRef);

  carouselRef = viewChild.required<ElementRef<HTMLDivElement>>("carouselHost");
  initialScroll = input(0);

  canScrollLeft = signal(false);
  canScrollRight = signal(true);

  constructor() {
    effect(() => {
      const ref = this.carouselRef();
      if (ref) {
        ref.nativeElement.scrollLeft = this.initialScroll();
        this.checkScrollability();
      }
    });

    this.carouselService.cardClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((index) => {
        this.onCardClose(index);
      });
  }

  checkScrollability(): void {
    const el = this.carouselRef()?.nativeElement;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      this.canScrollLeft.set(scrollLeft > 0);
      this.canScrollRight.set(scrollLeft < scrollWidth - clientWidth);
    }
  }

  scrollLeft(): void {
    this.carouselRef()?.nativeElement.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  }

  scrollRight(): void {
    this.carouselRef()?.nativeElement.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  }

  private onCardClose(index: number): void {
    const el = this.carouselRef()?.nativeElement;
    if (el) {
      const cardWidth = this.isMobile() ? 230 : 384;
      const gap = this.isMobile() ? 16 : 32;
      const scrollPosition = (cardWidth + gap) * (index + 1) - cardWidth / 2;

      el.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      this.carouselService.currentIndex.set(index);
    }
  }

  private isMobile(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth < 768;
    }
    return false;
  }
}

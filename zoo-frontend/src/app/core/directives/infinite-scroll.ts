import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  output,
} from "@angular/core";

@Directive({
  selector: "[appInfiniteScroll]",
})
export class InfiniteScroll implements OnDestroy {
  scrolled = output<void>();

  private elementRef = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  constructor() {
    afterNextRender(() => {
      this.setupObserver();
    });
  }

  private setupObserver() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.scrolled.emit();
      }
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}

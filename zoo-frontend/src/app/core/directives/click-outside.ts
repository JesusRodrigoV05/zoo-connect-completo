import { Directive, ElementRef, inject, output } from "@angular/core";

@Directive({
  selector: "[clickOutside]",
  host: {
    "(document:mousedown)": "onDocumentClick($event)",
    "(document:touchstart)": "onDocumentClick($event)",
  },
})
export class ClickOutside {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly clickOutside = output<Event>();

  onDocumentClick(event: Event): void {
    const clickedInside = this.elementRef.nativeElement.contains(
      event.target as Node,
    );
    if (!clickedInside) {
      this.clickOutside.emit(event);
    }
  }
}

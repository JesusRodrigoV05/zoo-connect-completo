import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild,
} from "@angular/core";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrollSmoother from "gsap/ScrollSmoother";
import { isPlatformBrowser } from "@angular/common";
import { createNoise2D } from "simplex-noise";

@Component({
  selector: "app-scrolling-rainbow",
  imports: [],
  templateUrl: "./scrolling-rainbow.html",
  styleUrl: "./scrolling-rainbow.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollingRainbow implements OnInit {
  private platformID = inject(PLATFORM_ID);
  contentRef = viewChild.required<ElementRef>("#content");
  wrapperRef = viewChild.required<ElementRef>("#wrapper");

  ngOnInit(): void {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    if (isPlatformBrowser(this.platformID)) {
      this.initAnimation();
    }
  }

  initAnimation(): void {
    const content = this.contentRef().nativeElement;
    const noise2D = createNoise2D();

    for (let i = 0; i < 5000; i++) {
      const div = document.createElement("div");
      div.classList.add("circle");

      const n1 = noise2D(i * 0.003, i * 0.0033);
      const n2 = noise2D(i * 0.002, i * 0.001);

      const style = {
        transform: `translate(${n2 * 200}px) rotate(${n2 * 270}deg) scale(${3 + n1 * 2}, ${3 + n2 * 2})`,
        boxShadow: `0 0 0 .2px hsla(${Math.floor(i * 0.3)}, 70%, 70%, .6)`,
      };
      Object.assign(div.style, style);
      content.appendChild(div);
    }
    const Circles = document.querySelectorAll(".circle");
  }
}

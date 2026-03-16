import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from "@angular/core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

@Component({
  selector: "app-our-story",
  imports: [],
  templateUrl: "./our-story.html",
  styleUrl: "./our-story.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurStory implements OnDestroy {
  private scrollTriggerInstance: ScrollTrigger | undefined;

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(ScrollTrigger);
      this.initScroll();
    });
  }

  private initScroll() {
    const section = document.querySelector(".horizontal-timeline");
    const pinWrap = document.querySelector(".pin-wrap");
    const animWrap = document.querySelector(".animation-wrap");

    if (!section || !pinWrap || !animWrap) return;

    const getToValue = () => -(animWrap.scrollWidth - window.innerWidth);

    gsap.fromTo(
      animWrap,
      { x: 0 },
      {
        x: getToValue(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + (animWrap.scrollWidth - window.innerWidth),
          pin: pinWrap,
          invalidateOnRefresh: true,
          scrub: 1,
        },
      },
    );
  }

  ngOnDestroy(): void {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}

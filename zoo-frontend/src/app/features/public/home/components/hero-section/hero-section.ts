import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  PLATFORM_ID,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthStore } from "@app/core/stores/auth.store";
import { OnboardingService } from "@app/shared/services/onboarding.service";
import { ButtonModule } from "primeng/button";
import { GalleriaModule } from "primeng/galleria";
import AOS from "aos";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

@Component({
  selector: "app-hero-section",
  imports: [RouterLink, ButtonModule, GalleriaModule],
  templateUrl: "./hero-section.html",
  styleUrl: "./hero-section.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  split: any;
  animation: any;
  heroTitleRef = viewChild<ElementRef>("heroTitle");
  private readonly authStore = inject(AuthStore);
  private readonly onboarding = inject(OnboardingService);
  protected readonly autenticado = computed(() => !!this.authStore.usuario());

  constructor() {
    afterNextRender(() => {
      const target = this.heroTitleRef()?.nativeElement;
      if (target && !this.split) {
        try {
          if (typeof SplitText !== "undefined") {
            gsap.registerPlugin(SplitText);
            this.setup();
            this.splitText();
          } else {
            console.error("SplitText is not defined. Make sure GSAP Club plugins are installed.");
          }
          AOS.refresh();
        } catch (e) {
          console.error("Error initializing SplitText:", e);
        }
      }
    });
  }

  protected readonly stats = [
    { number: "200+", label: "Especies" },
    { number: "30", label: "Años" },
    { number: "1M+", label: "Visitantes" },
  ];
  protected readonly heroImages = [
    {
      url: "assets/images/hero-carousel/1.jpg",
      alt: "León majestuoso",
    },
    {
      url: "assets/images/hero-carousel/2.jpg",
      alt: "Tigre caminando",
    },
    {
      url: "assets/images/hero-carousel/3.jpeg",
      alt: "Panda comiendo bambú",
    },
    {
      url: "assets/images/hero-carousel/4.jpg",
      alt: "Panda comiendo bambú",
    },
    {
      url: "assets/images/hero-carousel/5.jpg",
      alt: "Panda comiendo bambú",
    },
    {
      url: "assets/images/hero-carousel/6.jpg",
      alt: "Panda comiendo bambú",
    },
  ];

  setup() {
    try {
      if (this.split && typeof this.split.revert === "function") {
        this.split.revert();
      }

      const target = this.heroTitleRef()?.nativeElement;

      if (target && typeof SplitText !== "undefined") {
        this.split = SplitText.create(target, {
          type: "chars, words, lines",
        });
      }
    } catch (e) {
      console.error("SplitText setup failed:", e);
    }
  }

  splitText() {
    try {
      if (this.animation && typeof this.animation.revert === "function") {
        this.animation.revert();
      }
      
      const currentSplit = this.split;
      if (!currentSplit || !currentSplit.chars) return;

      this.animation = gsap.from(currentSplit.chars, {
        x: 150,
        opacity: 0,
        duration: 0.7,
        stagger: 0.05,
        ease: "power4",
      });
    } catch (e) {
      console.error("SplitText animation failed:", e);
    }
  }

  protected startGuidedTour(): void {
    this.onboarding.startTour("public-inicio");
  }

  ngOnDestroy() {
    if (this.split) this.split.revert();
    if (this.animation) this.animation.kill();
  }
}

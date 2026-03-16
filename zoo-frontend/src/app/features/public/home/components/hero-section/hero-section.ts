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
  protected readonly autenticado = computed(() => !!this.authStore.usuario());

  constructor() {
    afterNextRender(() => {
      gsap.registerPlugin(SplitText);
      AOS.refresh();
      this.setup();
      this.splitText();
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
    if (this.split) this.split.revert();

    const target = this.heroTitleRef()?.nativeElement;

    if (target) {
      this.split = SplitText.create(target, {
        type: "chars, words, lines",
      });
    }
  }

  splitText() {
    if (this.animation) this.animation.revert();

    this.animation = gsap.from(this.split.chars, {
      x: 150,
      opacity: 0,
      duration: 0.7,
      stagger: 0.05,
      ease: "power4",
    });
  }

  ngOnDestroy() {
    if (this.split) this.split.revert();
    if (this.animation) this.animation.kill();
  }
}

import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
} from "@angular/core";
import AOS from "aos";

interface SocialButton {
  icon: string;
  link: string;
  variant: "facebook" | "twitter" | "instagram" | "youtube";
  label: string;
}

@Component({
  selector: "app-social-section",
  imports: [],
  templateUrl: "./social-section.html",
  styleUrl: "./social-section.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialSection {
  constructor() {
    afterRenderEffect(() => {
      AOS.refresh();
    });
  }

  protected readonly socialButtons: SocialButton[] = [
    {
      icon: "pi pi-facebook",
      link: "https://facebook.com/zooconnect",
      variant: "facebook",
      label: "Facebook",
    },
    {
      icon: "pi pi-twitter",
      link: "https://twitter.com/zooconnect",
      variant: "twitter",
      label: "Twitter",
    },
    {
      icon: "pi pi-instagram",
      link: "https://instagram.com/zooconnect",
      variant: "instagram",
      label: "Instagram",
    },
    {
      icon: "pi pi-youtube",
      link: "https://youtube.com/zooconnect",
      variant: "youtube",
      label: "YouTube",
    },
  ];
}

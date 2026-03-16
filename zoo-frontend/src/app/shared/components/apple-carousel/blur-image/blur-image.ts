import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-blur-image",
  imports: [NgOptimizedImage],
  templateUrl: "./blur-image.html",
  styleUrl: "./blur-image.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlurImage {
  src = input.required<string>();
  alt = input.required<string>();
  extraClass = input<string>("");
  isLoading = signal(true);

  imageClass = computed(() => {
    const loadingState = this.isLoading() ? "image-loading" : "image-loaded";
    return `${loadingState} ${this.extraClass()}`;
  });
}

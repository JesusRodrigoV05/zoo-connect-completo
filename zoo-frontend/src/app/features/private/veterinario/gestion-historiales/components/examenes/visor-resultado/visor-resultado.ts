import { NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { Loader } from "@app/shared/components";
import { ButtonModule } from "primeng/button";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: "app-visor-resultado",
  imports: [ButtonModule, NgOptimizedImage, Loader],
  templateUrl: "./visor-resultado.html",
  styleUrl: "./visor-resultado.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisorResultado {
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);

  isLoading = signal(true);

  get url(): string {
    return this.config.data?.url;
  }

  onImageLoad() {
    this.isLoading.set(false);
  }

  cerrar() {
    this.ref.close();
  }
}

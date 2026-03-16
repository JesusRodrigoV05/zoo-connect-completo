import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  effect,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { Noticia } from "@models/noticias/noticia.model";
import { ButtonModule } from "primeng/button";
import { ImageModule } from "primeng/image";
import { SkeletonModule } from "primeng/skeleton";
import { TagModule } from "primeng/tag";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { finalize } from "rxjs";
import { AdminNoticias } from "@app/features/private/admin/services/noticias";

@Component({
  selector: "zoo-noticia-detalle",
  imports: [
    DatePipe,
    ButtonModule,
    ImageModule,
    TagModule,
    SkeletonModule,
    RouterLink,
    ScrollPanelModule,
  ],
  templateUrl: "./noticia-detalle.html",
  styleUrl: "./noticia-detalle.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticiaDetalle {
  readonly noticiaId = input.required<string>();

  private readonly noticiasService = inject(AdminNoticias);

  protected readonly noticia = signal<Noticia | null>(null);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.noticiaId();
      if (id) {
        this.loadNoticia(id);
      }
    });
  }

  private loadNoticia(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.noticia.set(null);

    this.noticiasService
      .getNoticiaById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.noticia.set(data),
        error: (err) => {
          console.error(err);
          this.error.set("No se pudo cargar la información de la noticia.");
        },
      });
  }
}

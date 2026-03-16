import { NgClass } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { ZooItemActionButton } from "@app/shared/components/ui/zoo-item-action-button";
import { Noticia } from "@models/noticias/noticia.model";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";

@Component({
  selector: "zoo-noticia-item",
  imports: [NgClass, ButtonModule, TagModule, ZooItemActionButton],
  templateUrl: "./noticia-item.html",
  styleUrl: "./noticia-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticiaItem {
  noticia = input.required<Noticia>();
  layout = input.required<"list" | "grid">();

  onDetails = output<void>();
  onEdit = output<string>();
  onDelete = output<void>();
}

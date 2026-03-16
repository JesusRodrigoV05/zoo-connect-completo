import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NewsArticle } from "../../models/news.models";
import { NgClass, NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-noticia-item",
  imports: [NgOptimizedImage, NgClass],
  templateUrl: "./noticia-item.html",
  styleUrl: "./noticia-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticiaItem {
  news = input.required<NewsArticle>();
}

import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { NoticiaItem } from "../noticia-item/noticia-item";
import { NewsArticle } from "../../models/news.models";

@Component({
  selector: "app-noticias-section",
  imports: [NoticiaItem],
  templateUrl: "./noticias-section.html",
  styleUrl: "./noticias-section.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticiasSection {
  protected newsList = signal<NewsArticle[]>([
    {
      id: 1,
      title: "¡Nuevos habitantes: Pandas Rojos!",
      description:
        "Damos la bienvenida a una familia de pandas rojos rescatados que ahora llaman hogar a nuestro santuario.",
      date: "15 Oct, 2025",
      imageUrl:
        "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80&w=800&auto=format&fit=crop",
      tag: { label: "Nuevo", type: "new" },
    },
    {
      id: 2,
      title: "Descuento Estudiantil",
      description:
        "Presenta tu credencial universitaria vigente y obtén un 50% de descuento en tu entrada durante todo el mes.",
      date: "10 Oct, 2025",
      imageUrl:
        "https://images.unsplash.com/photo-1503066211613-c17ebc9daef0?q=80&w=800&auto=format&fit=crop",
      tag: { label: "Promoción", type: "promo" },
    },
    {
      id: 3,
      title: "Noche de Especies Nocturnas",
      description:
        "Una caminata guiada especial bajo la luna para observar el comportamiento de nuestros animales nocturnos.",
      date: "05 Oct, 2025",
      imageUrl:
        "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=800&auto=format&fit=crop",
      tag: { label: "Evento", type: "event" },
    },
  ]);
}

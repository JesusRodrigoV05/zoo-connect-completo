import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { SplitterModule } from "primeng/splitter";
import { SplitterLayout } from "../../components/splitter-layout";
import { MainContainer } from "@app/shared/components/main-container";
import { ButtonModule } from "primeng/button";
import { NavMenuGestion } from "../../components/nav-menu-gestion";
import { MenuButton } from "@models/common/menu-button.mode";

@Component({
  selector: "app-gestion-noticias",
  imports: [
    SplitterModule,
    RouterOutlet,
    ScrollPanelModule,
    SplitterLayout,
    MainContainer,
    ButtonModule,
    NavMenuGestion,
  ],
  templateUrl: "./gestion-noticias.html",
  styleUrl: "./gestion-noticias.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionNoticias {
  buttons = signal<MenuButton[]>([
    {
      icono: "pi pi-list",
      texto: "Lista de Noticias",
      descripcion: "Administra el historial de publicaciones y su visibilidad.",
      ruta: "/admin/noticias/",
      exacto: true,
    },
    {
      icono: "pi pi-plus",
      texto: "Publicar Noticia",
      descripcion: "Redacta y comparte novedades con la comunidad.",
      ruta: "/admin/noticias/crear",
    },
  ]);
}

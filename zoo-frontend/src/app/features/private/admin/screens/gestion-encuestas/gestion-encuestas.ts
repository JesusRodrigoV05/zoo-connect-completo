import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SplitterModule } from "primeng/splitter";
import { SplitterLayout } from "../../components/splitter-layout/splitter-layout";
import { RouterOutlet } from "@angular/router";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { MainContainer } from "@app/shared/components/main-container";
import { NavMenuGestion } from "../../components/nav-menu-gestion";
import { MenuButton } from "../../models";

interface TabOption {
  readonly label: string;
  readonly component: string;
  readonly icon: string;
}

@Component({
  selector: "app-gestion-encuestas",
  imports: [
    SplitterModule,
    RouterOutlet,
    ScrollPanelModule,
    SplitterLayout,
    MainContainer,
    NavMenuGestion,
  ],
  templateUrl: "./gestion-encuestas.html",
  styleUrl: "./gestion-encuestas.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionEncuestas {
  protected readonly buttons = signal<MenuButton[]>([
    {
      icono: "pi pi-list",
      texto: "Lista",
      descripcion: "Ver y gestionar todas las encuestas creadas.",
      ruta: "/admin/encuestas/",
      exacto: true,
    },
    {
      icono: "pi pi-plus",
      texto: "Crear Encuesta",
      descripcion: "Diseñar una nueva encuesta desde cero.",
      ruta: "/admin/encuestas/crear",
    },
  ]);
}

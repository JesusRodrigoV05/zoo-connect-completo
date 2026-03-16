import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SplitterLayout } from "../../cuidador/layout/splitter-layout";
import { MainContainer } from "@app/shared/components/main-container";
import { NavMenuVet } from "../../cuidador/components/nav-menu-vet/nav-menu-vet";
import { MenuButton } from "@models/common/menu-button.mode";

@Component({
  selector: "app-gestion-historiales",
  imports: [RouterOutlet, SplitterLayout, MainContainer, NavMenuVet],
  templateUrl: "./gestion-historiales.html",
  styleUrl: "./gestion-historiales.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionHistoriales {
  vetUrl = "/vet/historiales";
  buttons: MenuButton[] = [
    {
      texto: "Historiales Clínicos",
      icono: "pi pi-book",
      ruta: this.vetUrl,
      exacto: true,
      descripcion: "Consulta y gestión de expedientes médicos.",
    },
    {
      texto: "Tipos de Atención",
      icono: "pi pi-tag",
      ruta: `${this.vetUrl}/configuracion/tipos-atencion`,
      descripcion: "Catálogo de motivos de consulta (Urgencia, Control, etc).",
    },
    {
      texto: "Tipos de Examen",
      icono: "pi pi-list",
      ruta: `${this.vetUrl}/configuracion/tipos-examen`,
      descripcion: "Catálogo de pruebas de laboratorio disponibles.",
    },
  ];
}

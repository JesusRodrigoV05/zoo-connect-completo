import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { SplitterLayout } from "../layout/splitter-layout";
import { MainContainer } from "@app/shared/components/main-container";
import { NavMenuVet } from "../components/nav-menu-vet/nav-menu-vet";
import { MenuButton } from "@models/common/menu-button.mode";

@Component({
  selector: "app-gestion-dietas",
  imports: [
    ButtonModule,
    RouterOutlet,
    SplitterLayout,
    MainContainer,
    NavMenuVet,
  ],
  templateUrl: "./gestion-dietas.html",
  styleUrl: "./gestion-dietas.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionDietas {
  buttons: MenuButton[] = [
    {
      texto: "Crear Nueva Dieta",
      icono: "pi pi-clipboard-pencil",
      ruta: "/vet/dietas/crear",
      descripcion: "Diseñar un nuevo plan nutricional (Receta)",
    },
    {
      texto: "Lista Dietas",
      icono: "pi pi-list",
      ruta: "/vet/dietas/",
      descripcion:
        "Revisar y gestionar los planes nutricionales asignados a animales y especies",
    },
  ];
}

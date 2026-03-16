import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SplitterLayout } from "../../components/splitter-layout";
import { MainContainer } from "@app/shared/components/main-container";
import { NavMenuGestion } from "../../components/nav-menu-gestion";
import { RouterOutlet } from "@angular/router";
import { MenuButton } from "../../models";

@Component({
  selector: "app-gestion-tareas",
  imports: [SplitterLayout, MainContainer, NavMenuGestion, RouterOutlet],
  templateUrl: "./gestion-tareas.html",
  styleUrl: "./gestion-tareas.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionTareas {
  protected readonly buttons: MenuButton[] = [
    {
      texto: "Tablero de Operaciones",
      icono: "pi pi-list-check",
      descripcion:
        "Gestión en tiempo real del flujo de trabajo y asignaciones diarias.",
      ruta: "/admin/tareas/operaciones",
    },
    {
      texto: "Planificador de Rutinas",
      icono: "pi pi-calendar-plus",
      descripcion:
        "Programación de tareas automáticas, alimentación y mantenimiento.",
      ruta: "/admin/tareas/planificador",
    },
    {
      texto: "Configuración Tipos",
      icono: "pi pi-sliders-h",
      descripcion: "Definición de tipos de tareas.",
      ruta: "/admin/tareas/configuracion",
    },
  ];
}

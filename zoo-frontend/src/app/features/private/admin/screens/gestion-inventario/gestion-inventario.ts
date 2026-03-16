import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SplitterLayout } from "../../components/splitter-layout";
import { MainContainer } from "@app/shared/components/main-container";
import { NavMenuGestion } from "../../components/nav-menu-gestion";
import { RouterOutlet } from "@angular/router";
import { MenuButton } from "../../models";

@Component({
  selector: "app-gestion-inventario",
  imports: [SplitterLayout, MainContainer, NavMenuGestion, RouterOutlet],
  templateUrl: "./gestion-inventario.html",
  styleUrl: "./gestion-inventario.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionInventario {
  protected readonly buttons: MenuButton[] = [
    {
      icono: "pi pi-plus-circle",
      texto: "Crear producto",
      descripcion: "Dar de alta un nuevo ítem en el almacén",
      ruta: "/admin/inventario/crear",
      exacto: true,
    },
    {
      icono: "pi pi-box",
      texto: "Lista de Productos",
      descripcion: "Consultar stock, precios y estados del inventario",
      ruta: "/admin/inventario",
      exacto: true,
    },
    {
      icono: "pi pi-user-plus",
      texto: "Crear proveedor",
      descripcion: "Registrar un nuevo socio o distribuidor",
      ruta: "/admin/inventario/proveedor/crear",
      exacto: true,
    },
    {
      icono: "pi pi-users",
      texto: "Lista de Proveedores",
      descripcion: "Administrar el directorio de proveedores activos",
      ruta: "/admin/inventario/proveedor",
      exacto: true,
    },
    /*
    {
      icono: "pi pi-tag",
      texto: "Crear tipo producto",
      descripcion: "Definir nueva categoría para clasificación",
      ruta: "/admin/inventario/tipo/crear",
      exacto: true,
    },
  */
    {
      icono: "pi pi-tags",
      texto: "Lista de tipos",
      descripcion: "Gestionar familias y categorías de productos",
      ruta: "/admin/inventario/tipo",
      exacto: true,
    },
    /*
    {
      icono: "pi pi-pencil",
      texto: "Crear unidad medida",
      descripcion: "Registrar nueva magnitud (kg, litro, unidad)",
      ruta: "/admin/inventario/unidades/crear",
      exacto: true,
    },
    */
    {
      icono: "pi pi-sliders-h",
      texto: "Lista de unidades",
      descripcion: "Configurar métricas de conversión del sistema",
      ruta: "/admin/inventario/unidades",
      exacto: true,
    },
    {
      icono: "pi pi-history",
      texto: "Historial de movimientos",
      descripcion: "Ver registro de entradas y salidas",
      ruta: "/admin/inventario/transacciones",
      exacto: true,
    },
  ];
}

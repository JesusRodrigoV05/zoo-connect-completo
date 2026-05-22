import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MainContainer } from "@app/shared/components/main-container";
import { NavMenuGestion } from "../../components/nav-menu-gestion";
import { RouterOutlet } from "@angular/router";
import { MenuButton } from "../../models";
import { SplitterLayout } from "@core/layout/splitter-layout";

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
      permisos: ["inventory_create_product"],
      exacto: true,
    },
    {
      icono: "pi pi-box",
      texto: "Lista de Productos",
      descripcion: "Consultar stock, precios y estados del inventario",
      ruta: "/admin/inventario",
      permisos: ["inventory_list_products"],
      exacto: true,
    },
    {
      icono: "pi pi-user-plus",
      texto: "Crear proveedor",
      descripcion: "Registrar un nuevo socio o distribuidor",
      ruta: "/admin/inventario/proveedor/crear",
      permisos: ["inventory_create_supplier"],
      exacto: true,
    },
    {
      icono: "pi pi-users",
      texto: "Lista de Proveedores",
      descripcion: "Administrar el directorio de proveedores activos",
      ruta: "/admin/inventario/proveedor",
      permisos: ["inventory_list_suppliers"],
      exacto: true,
    },
    {
      icono: "pi pi-tags",
      texto: "Lista de tipos",
      descripcion: "Gestionar familias y categorías de productos",
      ruta: "/admin/inventario/tipo",
      permisos: ["inventory_list_types"],
      exacto: true,
    },
    {
      icono: "pi pi-sliders-h",
      texto: "Lista de unidades",
      descripcion: "Configurar métricas de conversión del sistema",
      ruta: "/admin/inventario/unidades",
      permisos: ["inventory_list_units"],
      exacto: true,
    },
    {
      icono: "pi pi-history",
      texto: "Historial de movimientos",
      descripcion: "Ver registro de entradas y salidas",
      ruta: "/admin/inventario/transacciones",
      permisos: ["inventory_movements_history"],
      exacto: true,
    },
  ];
}

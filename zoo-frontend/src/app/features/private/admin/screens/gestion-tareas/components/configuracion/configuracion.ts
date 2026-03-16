import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { Loader } from "@app/shared/components";
import { ButtonModule } from "primeng/button";
import { DataViewModule } from "primeng/dataview";
import { SelectButtonModule } from "primeng/selectbutton";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { FormsModule } from "@angular/forms";
import { TipoTareaItem } from "../tipos/tipo-tarea-item/tipo-tarea-item";
import { CrearTipoTarea } from "../tipos/crear-tipo-tarea/crear-tipo-tarea";
import { TiposTareaStore } from "@app/features/private/admin/stores/tareas/admin-tipo-tares.store";
import { TipoTarea } from "@app/features/private/admin/models/tareas/tarea.model";

@Component({
  selector: "app-configuracion",
  imports: [
    DataViewModule,
    ButtonModule,
    SelectButtonModule,
    ConfirmDialogModule,
    FormsModule,
    Loader,
    TipoTareaItem,
    CrearTipoTarea,
  ],
  templateUrl: "./configuracion.html",
  styleUrl: "../../../lista-styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class Configuracion implements OnInit {
  readonly store = inject(TiposTareaStore);
  private confirmationService = inject(ConfirmationService);

  layout: "list" | "grid" = "list";
  layoutOptions = [
    { icon: "pi pi-list", value: "list" },
    { icon: "pi pi-table", value: "grid" },
  ];

  modalVisible = signal(false);
  editingItem = signal<TipoTarea | null>(null);

  ngOnInit() {
    this.store.loadItems();
  }

  openCreate() {
    this.editingItem.set(null);
    this.modalVisible.set(true);
  }

  openEdit(id: number) {
    const item = this.store.items().find((t) => t.id === id);
    if (item) {
      this.editingItem.set(item);
      this.modalVisible.set(true);
    }
  }

  deleteItem(id: number) {
    this.confirmationService.confirm({
      message: "¿Cambiar el estado de este tipo de tarea?",
      header: "Confirmar Acción",
      icon: "pi pi-exclamation-triangle",
      accept: () => this.store.deleteItem(id),
    });
  }
}

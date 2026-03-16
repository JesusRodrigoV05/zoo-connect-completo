import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TabsModule } from "primeng/tabs";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { TooltipModule } from "primeng/tooltip";
import { TablaEntradas } from "../tabla-entradas/tabla-entradas";
import { TablaSalidas } from "../tabla-salidas/tabla-salidas";
import { TransaccionesStore } from "@app/features/private/admin/stores/admin-transacciones.store";
import { TiposSalidaStore } from "@app/features/private/admin/stores/admin-tipo-salidas.store";
import { DatePicker } from "primeng/datepicker";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-historial",
  imports: [
    TabsModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    FormsModule,
    TablaEntradas,
    TablaSalidas,
    RouterLink,
  ],
  templateUrl: "./historial.html",
  styleUrl: "./historial.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Historial implements OnInit {
  readonly transactionStore = inject(TransaccionesStore);

  protected dateRange = signal<Date[] | null>(null);
  protected searchTerm = signal("");

  protected activeTab = signal<"entradas" | "salidas">("entradas");

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.activeTab() === "entradas") {
      this.transactionStore.loadEntradas({ page: 1, size: 20 });
    } else {
      this.transactionStore.loadSalidas({ page: 1, size: 20 });
    }
  }

  onTabChange(value: string | number | undefined) {
    if (!value) return;

    const tabValue = value as "entradas" | "salidas";

    if (this.activeTab() !== tabValue) {
      this.activeTab.set(tabValue);
      this.loadData();
    }
  }

  applyFilters() {
    console.log("Aplicando filtros:", this.searchTerm(), this.dateRange());
    this.loadData();
  }

  onPageChange(event: { page: number; size: number }) {
    if (this.activeTab() === "entradas") {
      this.transactionStore.loadEntradas(event);
    } else {
      this.transactionStore.loadSalidas(event);
    }
  }

  clearFilters() {
    this.searchTerm.set("");
    this.dateRange.set(null);
    this.loadData();
  }
}

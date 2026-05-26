import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { TableModule, TableLazyLoadEvent } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { SkeletonModule } from "primeng/skeleton";
import { SalidaInventario } from "@app/features/private/admin/models/entradas-salidas/transacciones.model";

@Component({
  selector: "zoo-tabla-salidas",
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    SkeletonModule,
    DatePipe,
  ],
  templateUrl: "./tabla-salidas.html",
  styleUrl: "./tabla-salidas.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaSalidas {
  salidas = input.required<SalidaInventario[]>();
  loading = input.required<boolean>();
  totalRecords = input.required<number>();

  pageChange = output<{ page: number; size: number }>();

  onPage(event: TableLazyLoadEvent) {
    const page = (event.first ?? 0) / (event.rows ?? 10) + 1;
    this.pageChange.emit({ page, size: event.rows ?? 10 });
  }
}

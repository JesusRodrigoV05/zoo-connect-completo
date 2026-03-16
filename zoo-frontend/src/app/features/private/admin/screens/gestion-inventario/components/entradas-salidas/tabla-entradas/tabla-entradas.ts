import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { SkeletonModule } from "primeng/skeleton";
import { EntradaInventario } from "@app/features/private/admin/models/entradas-salidas/transacciones.model";
import { CurrencyPipe, DatePipe, NgClass } from "@angular/common";

@Component({
  selector: "zoo-tabla-entradas",
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    SkeletonModule,
    DatePipe,
    CurrencyPipe,
    NgClass,
  ],
  templateUrl: "./tabla-entradas.html",
  styleUrl: "./tabla-entradas.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaEntradas {
  entradas = input.required<EntradaInventario[]>();
  loading = input.required<boolean>();
  totalRecords = input.required<number>();

  pageChange = output<{ page: number; size: number }>();

  skeletonCols = Array(5).fill(0);

  onPage(event: any) {
    const page = event.first / event.rows + 1;
    this.pageChange.emit({ page, size: event.rows });
  }
}

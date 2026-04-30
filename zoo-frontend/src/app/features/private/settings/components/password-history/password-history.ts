import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TableModule } from "primeng/table";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { Auth } from "@features/auth/services/auth";
import { AuthStore } from "@stores/auth.store";
import { PasswordHistoryEntry } from "@models/usuario/password-history.model";
import { DatePipe } from "@angular/common";

@Component({
  selector: "password-history",
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
    DatePipe
  ],
  templateUrl: "./password-history.html",
  styleUrls: ["./password-history.scss"]
})
export class PasswordHistoryComponent implements OnInit {
  private authService = inject(Auth);
  private authStore = inject(AuthStore);
  
  protected passwordHistory = signal<PasswordHistoryEntry[]>([]);
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  
  ngOnInit(): void {
    this.loadPasswordHistory();
  }
  
  protected loadPasswordHistory(): void {
    this.loading.set(true);
    this.error.set(null);
    
    const userId = this.authStore.usuario()?.id;
    if (!userId) {
      this.error.set("No se pudo obtener la información del usuario");
      this.loading.set(false);
      return;
    }
    
    this.authService.getPasswordHistory(Number(userId), 10).subscribe({
      next: (history) => {
        this.passwordHistory.set(history);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar histórico de contraseñas:", err);
        this.error.set("Error al cargar el histórico de contraseñas");
        this.loading.set(false);
      }
    });
  }
  
  protected clearHistory(): void {
    if (!confirm("¿Estás seguro de que deseas limpiar todo el histórico de contraseñas?")) {
      return;
    }
    
    const userId = this.authStore.usuario()?.id;
    if (!userId) return;
    
    this.authService.clearPasswordHistory(Number(userId)).subscribe({
      next: () => {
        this.passwordHistory.set([]);
      },
      error: (err) => {
        console.error("Error al limpiar histórico:", err);
        this.error.set("Error al limpiar el histórico");
      }
    });
  }
}

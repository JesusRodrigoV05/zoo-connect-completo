import {
  afterRenderEffect,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { AuthStore } from "@stores/auth.store";
import { isPlatformBrowser } from "@angular/common";
import { ScrollTopModule } from "primeng/scrolltop";
import { Toast } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { MessageService } from "primeng/api";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmPopupModule } from "primeng/confirmpopup";

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    ScrollTopModule,
    Toast,
    ButtonModule,
    RouterLink,
    ConfirmDialogModule,
    ConfirmPopupModule,
  ],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App implements OnInit {
  protected title = "zoo-connect-web";
  private readonly authStore = inject(AuthStore);
  private platformId = inject(PLATFORM_ID);
  private messageService = inject(MessageService);

  constructor() {
    afterRenderEffect(async () => {
      if (isPlatformBrowser(this.platformId)) {
        const AOS = (await import("aos")).default;
        AOS.init({
          once: true,
          duration: 1000,
        });
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.authStore.suggest2FA()) {
      this.messageService.add({
        key: "toast-con-link",
        severity: "warn",
        summary: "Habilitación de Verificacion en dos pasos",
        detail:
          "Tu cuenta puede ser más segura si habilitas la verificación en dos pasos.",
      });
    }
  }

  cerrarToast() {
    this.messageService.clear("toast-con-link");
  }
}

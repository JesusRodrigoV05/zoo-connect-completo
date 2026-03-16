import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { FormsModule } from "@angular/forms";
import { CardModule } from "primeng/card";

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  whatsappEnabled: boolean;
}

interface NotificationPreferences {
  newEvents: boolean;
  animalUpdates: boolean;
  quizSurveys: boolean;
  zooNews: boolean;
}

@Component({
  selector: "notificaciones-ajustes",
  imports: [ToggleSwitchModule, FormsModule, CardModule],
  templateUrl: "./notificaciones-ajustes.html",
  styleUrls: ["./notificaciones-ajustes.scss", "../settings-content.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificacionesAjustes {
  protected readonly notificationSettings = signal<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: false,
    telegramEnabled: false,
    whatsappEnabled: false,
  });

  protected readonly notificationPreferences = signal<NotificationPreferences>({
    newEvents: true,
    animalUpdates: true,
    quizSurveys: true,
    zooNews: true,
  });

  protected updateNotificationSetting(
    key: keyof NotificationSettings,
    value: boolean,
  ): void {
    this.notificationSettings.update((settings) => ({
      ...settings,
      [key]: value,
    }));
    // Guardar...
    console.log("Notification settings updated:", this.notificationSettings());
  }

  protected updateNotificationPreference(
    key: keyof NotificationPreferences,
    value: boolean,
  ): void {
    this.notificationPreferences.update((preferences) => ({
      ...preferences,
      [key]: value,
    }));
    // Guardar...
    console.log(
      "Notification preferences updated:",
      this.notificationPreferences(),
    );
  }
}

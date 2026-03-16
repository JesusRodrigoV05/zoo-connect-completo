import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { FormsModule } from "@angular/forms";
import { TextareaModule } from "primeng/textarea";

@Component({
  selector: "app-contact-section",
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FloatLabelModule,
  ],
  templateUrl: "./contact-section.html",
  styleUrl: "./contact-section.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSection {
  readonly submitContact = output<void>();

  protected onSubmitContact(): void {
    this.submitContact.emit();
  }
}

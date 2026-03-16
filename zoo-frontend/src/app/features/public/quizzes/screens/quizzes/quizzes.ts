import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { GenerateQuiz } from "../../services";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { QuizDetalle } from "../quiz-detalle";
import { Loader } from "@app/shared/components";
import { InputTextModule } from "primeng/inputtext";
import { InputNumberModule } from "primeng/inputnumber";
import { FormsModule } from "@angular/forms";
import { GeneratedQuiz } from "@models/quiz";
import { ShowToast } from "@app/shared/services";
import { SelectModule } from "primeng/select";
import { AuthStore } from "@stores/auth.store";
import { RouterLink } from "@angular/router";
import { MainContainer } from "@app/shared/components/main-container";

@Component({
  selector: "app-quizzes",
  imports: [
    QuizDetalle,
    Loader,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CardModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: "./quizzes.html",
  styleUrl: "./quizzes.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Quizzes {
  private quizService = inject(GenerateQuiz);
  private toast = inject(ShowToast);
  readonly authStore = inject(AuthStore);

  config = {
    amount: 5,
    difficulty: "medio",
    category: "",
  };

  difficulties = [
    { label: "Fácil (Principiante)", value: "facil" },
    { label: "Medio (Explorador)", value: "medio" },
    { label: "Difícil (Experto)", value: "dificil" },
  ];

  generatedQuiz = signal<GeneratedQuiz | null>(null);
  isLoading = signal(false);

  createQuiz() {
    this.isLoading.set(true);
    this.generatedQuiz.set(null);

    this.quizService
      .generate(
        this.config.amount,
        this.config.difficulty,
        this.config.category,
      )
      .subscribe({
        next: (data) => {
          this.generatedQuiz.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error("Error generating quiz", err);
          this.isLoading.set(false);
          this.toast.showError("Error", "No se pudo contactar a la IA.");
        },
      });
  }

  reset() {
    this.generatedQuiz.set(null);
    this.config.category = "";
  }
}

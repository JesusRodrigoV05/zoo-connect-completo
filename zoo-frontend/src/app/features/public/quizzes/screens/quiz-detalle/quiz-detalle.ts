import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { GenerateQuiz, QuizManagement } from "../../services";
import { NgClass } from "@angular/common";
import { TagModule } from "primeng/tag";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { ProgressBarModule } from "primeng/progressbar";
import {
  CreateParticipacion,
  CreateTrivia,
  GeneratedQuestion,
  GeneratedQuiz,
} from "@models/quiz";
import { ShowToast } from "@app/shared/services";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-quiz-detalle",
  imports: [
    ButtonModule,
    CardModule,
    ProgressBarModule,
    TagModule,
    NgClass,
    RouterLink,
  ],
  templateUrl: "./quiz-detalle.html",
  styleUrl: "./quiz-detalle.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizDetalle {
  quiz = input.required<GeneratedQuiz>();

  private quizManagement = inject(QuizManagement);
  private toast = inject(ShowToast);

  currentQuestionIndex = signal(0);
  score = signal(0);
  isFinished = signal(false);
  isSaving = signal(false);

  selectedOption = signal<string | null>(null);
  isAnswered = signal(false);
  isCorrect = signal(false);

  get currentQuestion(): GeneratedQuestion {
    return this.quiz().preguntas[this.currentQuestionIndex()];
  }

  get progress(): number {
    return (
      ((this.currentQuestionIndex() + 1) / this.quiz().preguntas.length) * 100
    );
  }

  selectOption(option: string) {
    if (this.isAnswered()) return;

    this.selectedOption.set(option);
    this.isAnswered.set(true);

    const correct = option === this.currentQuestion.respuestaCorrecta;
    this.isCorrect.set(correct);

    if (correct) {
      this.score.update((s) => s + 1);
      this.toast.showSuccess("¡Correcto!", "Sumas un punto");
    } else {
      this.toast.showError("Incorrecto", "Sigue intentando");
    }
  }

  nextQuestion() {
    const total = this.quiz().preguntas.length;

    if (this.currentQuestionIndex() < total - 1) {
      this.resetQuestionState();
      this.currentQuestionIndex.update((i) => i + 1);
    } else {
      this.finishQuiz();
    }
  }

  private resetQuestionState() {
    this.selectedOption.set(null);
    this.isAnswered.set(false);
    this.isCorrect.set(false);
  }

  private finishQuiz() {
    this.isSaving.set(true);

    const quizData = this.quiz();

    const newTrivia: CreateTrivia = {
      fecha: new Date().toISOString(),
      cantidadPreguntas: quizData.preguntas.length,
      dificultad: quizData.dificultad,
    };

    this.quizManagement.createTrivia(newTrivia).subscribe({
      next: (createdTrivia) => {
        const participation: CreateParticipacion = {
          triviaId: createdTrivia.id,
          aciertos: this.score(),
        };

        this.quizManagement.submitParticipation(participation).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.isFinished.set(true);
            this.toast.showSuccess(
              "¡Quiz Guardado!",
              `Tu puntaje final: ${this.score()}`,
            );
          },
          error: (err) => {
            console.error("Error guardando participación", err);
            this.isSaving.set(false);
            this.isFinished.set(true);
            this.toast.showWarning(
              "Atención",
              "No se pudo guardar tu historial, pero buen juego.",
            );
          },
        });
      },
      error: (err) => {
        console.error("Error creando trivia", err);
        this.isSaving.set(false);
        this.isFinished.set(true);
        this.toast.showError(
          "Error",
          "No se pudo registrar el quiz en el sistema.",
        );
      },
    });
  }
}

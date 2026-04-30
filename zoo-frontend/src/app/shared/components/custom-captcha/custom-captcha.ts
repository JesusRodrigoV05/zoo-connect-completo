import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-custom-captcha',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  template: `
    <div class="custom-captcha-container" [class.verified]="verified">
      @if (!verified) {
        <div class="captcha-challenge">
          <div class="challenge-question">
            <i class="pi pi-shield" style="font-size: 1.5rem; color: var(--p-primary-color)"></i>
            <p>Por favor, completa la verificación:</p>
          </div>
          <div class="challenge-action">
            <label for="captcha-input">¿Cuánto es {{ num1 }} + {{ num2 }}?</label>
            <input 
              id="captcha-input"
              type="text" 
              pInputText
              [(ngModel)]="userAnswer" 
              placeholder="Respuesta"
              class="captcha-input"
              (keyup.enter)="checkAnswer()"
            />
          </div>
          <p-button 
            label="Verificar" 
            (onClick)="checkAnswer()"
            [disabled]="!userAnswer"
            styleClass="p-button-sm"
          ></p-button>
          @if (errorMessage) {
            <small class="p-error">{{ errorMessage }}</small>
          }
        </div>
      } @else {
        <div class="captcha-success">
          <i class="pi pi-check-circle" style="color: green; font-size: 1.5rem;"></i>
          <span>Verificación completada</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: 1rem 0;
    }
    .custom-captcha-container {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: #f9f9f9;
    }
    .captcha-challenge {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .challenge-question {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .challenge-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .captcha-input {
      width: 100px;
    }
    .captcha-success {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: green;
    }
  `]
})
export class CustomCaptcha implements OnInit, OnDestroy {
  @Output() verifiedChange = new EventEmitter<boolean>();
  @Output() tokenChange = new EventEmitter<string>();
  
  userAnswer: string = '';
  errorMessage: string = '';
  verified: boolean = false;
  num1: number = 0;
  num2: number = 0;
  private correctAnswer: number = 0;

  ngOnInit() {
    this.generateChallenge();
  }

  generateChallenge(): void {
    this.num1 = Math.floor(Math.random() * 10) + 1;
    this.num2 = Math.floor(Math.random() * 10) + 1;
    this.correctAnswer = this.num1 + this.num2;
    this.userAnswer = '';
    this.errorMessage = '';
    this.verified = false;
  }

  checkAnswer(): void {
    const answer = parseInt(this.userAnswer, 10);
    if (isNaN(answer)) {
      this.errorMessage = 'Por favor, ingresa un número válido';
      return;
    }

    if (answer === this.correctAnswer) {
      this.verified = true;
      this.errorMessage = '';
      this.verifiedChange.emit(true);
      // Generar un token simulado
      const token = `custom_captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.tokenChange.emit(token);
    } else {
      this.errorMessage = 'Respuesta incorrecta. Intenta de nuevo.';
      this.generateChallenge();
    }
  }

  ngOnDestroy(): void {
    // Limpiar estado si es necesario
  }

  reset(): void {
    this.generateChallenge();
    this.verifiedChange.emit(false);
    this.tokenChange.emit('');
  }
}

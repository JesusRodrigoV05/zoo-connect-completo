import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomCaptcha } from './custom-captcha';

describe('CustomCaptcha', () => {
  let component: CustomCaptcha;
  let fixture: ComponentFixture<CustomCaptcha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomCaptcha],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomCaptcha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit verified state and token when answer is correct', () => {
    let emittedVerified = false;
    let emittedToken = '';

    component.verifiedChange.subscribe((value) => {
      emittedVerified = value;
    });
    component.tokenChange.subscribe((value) => {
      emittedToken = value;
    });

    component.userAnswer = String(component.num1 + component.num2);
    component.checkAnswer();

    expect(component.verified).toBeTrue();
    expect(emittedVerified).toBeTrue();
    expect(emittedToken).toContain('custom_captcha_');
  });

  it('should reset verification state', () => {
    component.userAnswer = String(component.num1 + component.num2);
    component.checkAnswer();

    expect(component.verified).toBeTrue();

    component.reset();

    expect(component.verified).toBeFalse();
    expect(component.userAnswer).toBe('');
    expect(component.errorMessage).toBe('');
  });
});
export interface PasswordRules {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  digit: boolean;
  special: boolean;
  noRepeats: boolean;
  noSequence: boolean;
}

export function hasSequentialChars(s: string, seqLen = 4): boolean {
  const t = s.toLowerCase();
  for (let i = 0; i <= t.length - seqLen; i++) {
    const chunk = t.slice(i, i + seqLen);
    if (/^[a-z]+$/.test(chunk) || /^[0-9]+$/.test(chunk)) {
      const codes = Array.from(chunk).map(c => c.charCodeAt(0));
      const inc = codes.every((c, idx) => idx === 0 || c - codes[idx - 1] === 1);
      const dec = codes.every((c, idx) => idx === 0 || codes[idx - 1] - c === 1);
      if (inc || dec) return true;
    }
  }
  return false;
}

export function evaluatePasswordStrength(p: string): {
  rules: PasswordRules;
  percent: number;
  label: string;
  class: string;
} {
  const v = p || '';
  const rules: PasswordRules = {
    length: v.length >= 12,
    uppercase: /[A-Z]/.test(v),
    lowercase: /[a-z]/.test(v),
    digit: /[0-9]/.test(v),
    special: /[!@#$%^&*()\-=_+\[\]{}|;:,.<>?]/.test(v),
    noRepeats: !/(.)\1\1/.test(v),
    noSequence: !hasSequentialChars(v, 3),
  };

  const score = Object.values(rules).filter(Boolean).length;
  const totalRules = Object.keys(rules).length;
  let percent = Math.round((score / totalRules) * 100);
  let label: string;
  let cls: string;

  if (!rules.noRepeats || !rules.noSequence) {
    label = 'Insegura';
    cls = 'weak';
    percent = Math.min(percent, 20);
  } else if (score <= 3) {
    label = 'Débil';
    cls = 'weak';
  } else if (score <= 5) {
    label = 'Media';
    cls = 'medium';
  } else {
    label = 'Fuerte';
    cls = 'strong';
  }

  return { rules, percent, label, class: cls };
}

export function isPasswordStrong(rules: PasswordRules): boolean {
  return Object.values(rules).every(rule => rule === true);
}

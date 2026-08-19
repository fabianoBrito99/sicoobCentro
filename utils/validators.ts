import type { PlayerFormData } from "@/types/game";
import { onlyDigits } from "@/utils/masks";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidFullName(value: string): boolean {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);
  return digits.length >= 10 && digits.length <= 11;
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const calcDigit = (slice: string, factor: number): number => {
    let total = 0;
    for (let index = 0; index < slice.length; index += 1) {
      total += Number(slice[index]) * factor--;
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calcDigit(cpf.slice(0, 9), 10);
  const secondDigit = calcDigit(cpf.slice(0, 10), 11);

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}

export function validateForm(data: PlayerFormData): Record<keyof PlayerFormData, string> {
  return {
    fullName: isValidFullName(data.fullName) ? "" : "Informe nome e sobrenome.",
    cpf: isValidCpf(data.cpf) ? "" : "CPF invalido.",
    phone: isValidPhone(data.phone) ? "" : "Telefone invalido.",
    email: isValidEmail(data.email) ? "" : "E-mail invalido.",
    consentAccepted: data.consentAccepted ? "" : "Voce precisa autorizar o compartilhamento dos dados."
  };
}

export function isFormValid(data: PlayerFormData): boolean {
  const errors = validateForm(data);
  return Object.values(errors).every((value) => value === "");
}

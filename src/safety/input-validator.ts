import { ValidationResult } from '../types.js';

const MAX_LENGTH = 500;

export const validateUserInput = (input: string): ValidationResult => {
  if (isEmpty(input)) {
    return { valid: false, reason: 'Input cannot be empty' };
  }

  if (isTooLong(input)) {
    return { valid: false, reason: 'Input exceeds maximum length' };
  }

  if (hasInjectionAttempt(input)) {
    return { valid: false, reason: 'Input contains suspicious patterns' };
  }

  return { valid: true };
};

const isEmpty = (input: string): boolean => {
  return !input || input.trim().length === 0;
};

const isTooLong = (input: string): boolean => {
  return input.length > MAX_LENGTH;
};

const hasInjectionAttempt = (input: string): boolean => {
  const suspiciousPatterns = ['<script', 'javascript:', 'onerror=', 'onclick='];
  return suspiciousPatterns.some(pattern =>
    input.toLowerCase().includes(pattern)
  );
};

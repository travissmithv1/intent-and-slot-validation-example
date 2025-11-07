import { PIIDetection } from '../types.js';

const CREDIT_CARD_PATTERN = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;
const SSN_PATTERN = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/;
const PHONE_PATTERN = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

export const detectPII = (text: string): PIIDetection => {
  const types: string[] = [];

  if (hasCreditCard(text)) types.push('credit_card');
  if (hasSSN(text)) types.push('ssn');
  if (hasPhone(text)) types.push('phone');
  if (hasEmail(text)) types.push('email');

  return { hasPII: types.length > 0, types };
};

const hasCreditCard = (text: string): boolean => {
  return CREDIT_CARD_PATTERN.test(text);
};

const hasSSN = (text: string): boolean => {
  return SSN_PATTERN.test(text);
};

const hasPhone = (text: string): boolean => {
  return PHONE_PATTERN.test(text);
};

const hasEmail = (text: string): boolean => {
  return EMAIL_PATTERN.test(text);
};

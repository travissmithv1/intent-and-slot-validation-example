import { Intent } from '../types.js';

const VALID_INTENTS: readonly Intent[] = [
  'book_flight',
  'cancel_booking',
  'modify_booking',
  'check_status',
  'provide_info',
  'off_topic',
];

export const validateIntent = (intent: unknown): Intent => {
  if (!isString(intent)) {
    throw new Error('Intent must be a string');
  }

  if (!isValidIntent(intent)) {
    throw new Error(`Invalid intent: ${intent}`);
  }

  return intent;
};

const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const isValidIntent = (value: string): value is Intent => {
  return VALID_INTENTS.includes(value as Intent);
};

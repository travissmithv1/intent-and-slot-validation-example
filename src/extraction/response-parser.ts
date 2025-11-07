import { ParsedResponse } from '../types.js';
import { validateIntent } from './intent-validator.js';
import { validateSlots } from './slot-validator.js';

export const parseClaudeResponse = (response: string): ParsedResponse => {
  const parsed = parseJSON(response);
  const obj = validateStructure(parsed);

  return {
    intent: validateIntent(obj.intent),
    slots: validateSlots(obj.slots),
    missing_slots: validateMissingSlots(obj.missing_slots),
    user_message: validateUserMessage(obj.user_message),
  };
};

const parseJSON = (response: string): unknown => {
  try {
    const cleaned = stripMarkdownCodeBlocks(response);
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Invalid JSON in Claude response');
  }
};

const stripMarkdownCodeBlocks = (text: string): string => {
  return text.replace(/^```(?:json)?\n?/gm, '').replace(/\n?```$/gm, '').trim();
};

const validateStructure = (parsed: unknown): Record<string, unknown> => {
  if (!isObject(parsed)) {
    throw new Error('Response must be an object');
  }

  const required = ['intent', 'slots', 'missing_slots', 'user_message'];
  const missing = required.filter(field => !(field in parsed));

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  return parsed;
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const validateMissingSlots = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    throw new Error('missing_slots must be an array');
  }
  return value;
};

const validateUserMessage = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new Error('user_message must be a string');
  }
  return value;
};

import { ChatResponse, Slots } from '../types.js';
import { extractIntentAndSlots } from './claude-client.js';
import {
  getConversationHistory,
  saveMessage,
} from './conversation-store.js';
import { validateUserInput } from '../safety/input-validator.js';
import { detectPII } from '../safety/pii-detector.js';
import { updateSlots, getMissingRequiredSlots } from '../booking/slot-filler.js';
import logger from '../observability/logger.js';

const userSlots: Record<string, Slots> = {};

const getEmptySlots = (): Slots => ({
  departure_city: null,
  arrival_city: null,
  departure_date: null,
  return_date: null,
  passengers: null,
  class: null,
});

export const handleMessage = async (
  userId: string,
  message: string
): Promise<ChatResponse> => {
  const startTime = Date.now();

  const validation = validateUserInput(message);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const history = await getConversationHistory(userId);

  await saveMessage(userId, { role: 'user', content: message });

  const response = await extractIntentAndSlots(history, message);

  const piiCheck = detectPII(response.user_message);
  if (piiCheck.hasPII) {
    logger.warn('PII detected in response', { types: piiCheck.types });
  }

  const existingSlots = userSlots[userId] || getEmptySlots();
  const mergedSlots = updateSlots(existingSlots, response.slots);
  userSlots[userId] = mergedSlots;

  const missingSlots = getMissingRequiredSlots(mergedSlots, response.intent);
  const readyToBook = response.intent === 'book_flight' && missingSlots.length === 0;

  await saveMessage(userId, {
    role: 'assistant',
    content: response.user_message,
  });

  const latency = Date.now() - startTime;
  logger.info('Message handled', {
    userId,
    intent: response.intent,
    latency_ms: latency,
  });

  return {
    intent: response.intent,
    slots: mergedSlots,
    missing_slots: missingSlots,
    user_message: response.user_message,
    ready_to_book: readyToBook,
  };
};

export const getUserSlots = (userId: string): Slots => {
  return userSlots[userId] || getEmptySlots();
};

export const clearUserSlots = (userId: string): void => {
  delete userSlots[userId];
};

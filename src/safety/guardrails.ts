import { Intent, Slots } from '../types.js';

export const checkOffTopic = (intent: Intent): boolean => {
  return intent === 'off_topic';
};

export const checkInvalidSlots = (slots: Slots): string[] => {
  const errors: string[] = [];
  if (hasSameDepartureAndArrival(slots)) {
    errors.push('Departure and arrival cities cannot be the same');
  }
  if (hasInvalidReturnDate(slots)) {
    errors.push('Return date must be after departure date');
  }
  return errors;
};

const hasSameDepartureAndArrival = (slots: Slots): boolean => {
  if (!slots.departure_city || !slots.arrival_city) return false;
  return slots.departure_city === slots.arrival_city;
};

const hasInvalidReturnDate = (slots: Slots): boolean => {
  if (!slots.departure_date || !slots.return_date) return false;
  return new Date(slots.return_date) < new Date(slots.departure_date);
};

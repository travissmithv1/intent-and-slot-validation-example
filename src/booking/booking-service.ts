import { Slots, BookingResult } from '../types.js';

export const bookFlight = async (slots: Slots): Promise<BookingResult> => {
  if (!hasRequiredSlots(slots)) {
    return {
      success: false,
      error: 'Missing required booking information',
    };
  }

  const confirmationNumber = generateConfirmation();
  return {
    success: true,
    confirmation_number: confirmationNumber,
  };
};

const hasRequiredSlots = (slots: Slots): boolean => {
  return !!(
    slots.departure_city &&
    slots.arrival_city &&
    slots.departure_date &&
    slots.passengers
  );
};

const generateConfirmation = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

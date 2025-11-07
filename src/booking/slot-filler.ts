import { Slots, Intent } from '../types.js';

const REQUIRED_SLOTS: Record<Intent, string[]> = {
  book_flight: ['departure_city', 'arrival_city', 'departure_date', 'passengers'],
  cancel_booking: [],
  modify_booking: [],
  check_status: [],
  provide_info: [],
  off_topic: [],
};

export const updateSlots = (existingSlots: Slots, newSlots: Slots): Slots => {
  return {
    departure_city: newSlots.departure_city ?? existingSlots.departure_city,
    arrival_city: newSlots.arrival_city ?? existingSlots.arrival_city,
    departure_date: newSlots.departure_date ?? existingSlots.departure_date,
    return_date: newSlots.return_date ?? existingSlots.return_date,
    passengers: newSlots.passengers ?? existingSlots.passengers,
    class: newSlots.class ?? existingSlots.class,
  };
};

export const getMissingRequiredSlots = (slots: Slots, intent: Intent): string[] => {
  const required = REQUIRED_SLOTS[intent] || [];
  return required.filter(slotName => !hasSlotValue(slots, slotName));
};

const hasSlotValue = (slots: Slots, slotName: string): boolean => {
  const value = slots[slotName as keyof Slots];
  return value !== null && value !== undefined;
};

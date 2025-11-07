import { Slots, FlightClass } from '../types.js';

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const VALID_CLASSES: readonly FlightClass[] = ['economy', 'business', 'first'];

export const validateSlots = (slots: unknown): Slots => {
  if (!isObject(slots)) {
    throw new Error('Slots must be an object');
  }

  return {
    departure_city: validateCity(slots.departure_city),
    arrival_city: validateCity(slots.arrival_city),
    departure_date: validateDate(slots.departure_date),
    return_date: validateDate(slots.return_date),
    passengers: validatePassengers(slots.passengers),
    class: validateClass(slots.class),
  };
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const validateCity = (city: unknown): string | null => {
  if (city === null) return null;
  if (typeof city !== 'string') {
    throw new Error('City must be a string or null');
  }
  return city;
};

const validateDate = (date: unknown): string | null => {
  if (date === null) return null;
  if (typeof date !== 'string') {
    throw new Error('Date must be a string or null');
  }
  if (!isValidDateFormat(date)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  if (!isValidDate(date)) {
    throw new Error('Date is invalid');
  }
  if (isDateInPast(date)) {
    throw new Error('Date cannot be in the past');
  }
  return date;
};

const isValidDateFormat = (date: string): boolean => {
  return DATE_FORMAT.test(date);
};

const isValidDate = (date: string): boolean => {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date);
};

const isDateInPast = (date: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
};

const validatePassengers = (passengers: unknown): number | null => {
  if (passengers === null) return null;
  if (typeof passengers !== 'number') {
    throw new Error('Passengers must be a number or null');
  }
  if (!Number.isInteger(passengers)) {
    throw new Error('Passengers must be an integer');
  }
  if (passengers < 1 || passengers > 9) {
    throw new Error('Passengers must be between 1 and 9');
  }
  return passengers;
};

const validateClass = (flightClass: unknown): FlightClass | null => {
  if (flightClass === null) return null;
  if (typeof flightClass !== 'string') {
    throw new Error('Class must be a string or null');
  }
  if (!isValidClass(flightClass)) {
    throw new Error('Class must be economy, business, or first');
  }
  return flightClass as FlightClass;
};

const isValidClass = (value: string): value is FlightClass => {
  return VALID_CLASSES.includes(value as FlightClass);
};

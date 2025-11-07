import { checkOffTopic, checkInvalidSlots } from '../src/safety/guardrails.js';
import { Slots } from '../src/types.js';

describe('checkOffTopic', () => {
  it('returns true for off_topic intent', () => {
    expect(checkOffTopic('off_topic')).toBe(true);
  });

  it('returns false for book_flight intent', () => {
    expect(checkOffTopic('book_flight')).toBe(false);
  });
});

describe('checkInvalidSlots', () => {
  it('returns empty array for valid slots', () => {
    const slots: Slots = {
      departure_city: 'Boston',
      arrival_city: 'New York',
      departure_date: '2025-12-15',
      return_date: null,
      passengers: 2,
      class: 'economy',
    };
    expect(checkInvalidSlots(slots)).toEqual([]);
  });

  it('returns error when departure and arrival cities are the same', () => {
    const slots: Slots = {
      departure_city: 'Boston',
      arrival_city: 'Boston',
      departure_date: '2025-12-15',
      return_date: null,
      passengers: 2,
      class: 'economy',
    };
    const errors = checkInvalidSlots(slots);
    expect(errors).toHaveLength(1);
  });

  it('returns error when return date is before departure date', () => {
    const slots: Slots = {
      departure_city: 'Boston',
      arrival_city: 'New York',
      departure_date: '2025-12-15',
      return_date: '2025-12-10',
      passengers: 2,
      class: 'economy',
    };
    const errors = checkInvalidSlots(slots);
    expect(errors).toHaveLength(1);
  });

  it('returns empty array when return date is after departure date', () => {
    const slots: Slots = {
      departure_city: 'Boston',
      arrival_city: 'New York',
      departure_date: '2025-12-15',
      return_date: '2025-12-20',
      passengers: 2,
      class: 'economy',
    };
    expect(checkInvalidSlots(slots)).toEqual([]);
  });

  it('returns empty array when return date is null', () => {
    const slots: Slots = {
      departure_city: 'Boston',
      arrival_city: 'New York',
      departure_date: '2025-12-15',
      return_date: null,
      passengers: 2,
      class: 'economy',
    };
    expect(checkInvalidSlots(slots)).toEqual([]);
  });

  it('returns empty array when cities are null', () => {
    const slots: Slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: '2025-12-15',
      return_date: null,
      passengers: 2,
      class: 'economy',
    };
    expect(checkInvalidSlots(slots)).toEqual([]);
  });

  it('returns multiple errors for multiple violations', () => {
    const slots: Slots = {
      departure_city: 'Boston',
      arrival_city: 'Boston',
      departure_date: '2025-12-15',
      return_date: '2025-12-10',
      passengers: 2,
      class: 'economy',
    };
    const errors = checkInvalidSlots(slots);
    expect(errors.length).toBeGreaterThan(1);
  });
});

import { validateSlots } from '../src/extraction/slot-validator.js';

describe('validateSlots', () => {
  test('validates all null slots', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(validateSlots(slots)).toEqual(slots);
  });

  test('validates departure_city as string', () => {
    const slots = {
      departure_city: 'Boston',
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(validateSlots(slots).departure_city).toBe('Boston');
  });

  test('validates arrival_city as string', () => {
    const slots = {
      departure_city: null,
      arrival_city: 'New York',
      departure_date: null,
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(validateSlots(slots).arrival_city).toBe('New York');
  });

  test('validates departure_date in YYYY-MM-DD format', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: '2026-01-15',
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(validateSlots(slots).departure_date).toBe('2026-01-15');
  });

  test('validates return_date in YYYY-MM-DD format', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: '2026-01-20',
      passengers: null,
      class: null,
    };
    expect(validateSlots(slots).return_date).toBe('2026-01-20');
  });

  test('rejects departure_date in MM/DD/YYYY format', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: '01/15/2026',
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects departure_date in DD-MM-YYYY format', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: '15-01-2026',
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects invalid departure_date', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: '2026-13-45',
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects departure_date in the past', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: '2020-01-01',
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('validates passengers as positive integer', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: 2,
      class: null,
    };
    expect(validateSlots(slots).passengers).toBe(2);
  });

  test('rejects passengers less than 1', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: 0,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects passengers greater than 9', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: 10,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects negative passengers', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: -1,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects passengers as decimal', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: 2.5,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('validates economy class', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: null,
      class: 'economy' as const,
    };
    expect(validateSlots(slots).class).toBe('economy');
  });

  test('validates business class', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: null,
      class: 'business' as const,
    };
    expect(validateSlots(slots).class).toBe('business');
  });

  test('validates first class', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: null,
      class: 'first' as const,
    };
    expect(validateSlots(slots).class).toBe('first');
  });

  test('rejects invalid class value', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: null,
      class: 'premium',
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects departure_city as number', () => {
    const slots = {
      departure_city: 123,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects arrival_city as boolean', () => {
    const slots = {
      departure_city: null,
      arrival_city: true,
      departure_date: null,
      return_date: null,
      passengers: null,
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects passengers as string', () => {
    const slots = {
      departure_city: null,
      arrival_city: null,
      departure_date: null,
      return_date: null,
      passengers: '2',
      class: null,
    };
    expect(() => validateSlots(slots)).toThrow();
  });

  test('rejects missing slots object', () => {
    expect(() => validateSlots(undefined)).toThrow();
  });

  test('rejects null slots object', () => {
    expect(() => validateSlots(null)).toThrow();
  });

  test('rejects slots as array', () => {
    expect(() => validateSlots([])).toThrow();
  });

  test('validates complete valid slots object', () => {
    const slots = {
      departure_city: 'Boston',
      arrival_city: 'New York',
      departure_date: '2026-01-15',
      return_date: '2026-01-20',
      passengers: 2,
      class: 'business' as const,
    };
    expect(validateSlots(slots)).toEqual(slots);
  });
});

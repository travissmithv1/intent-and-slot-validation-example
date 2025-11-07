import { parseClaudeResponse } from '../src/extraction/response-parser.js';

describe('parseClaudeResponse', () => {
  test('parses valid JSON response', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: 'Boston',
        arrival_city: 'New York',
        departure_date: '2026-01-15',
        return_date: null,
        passengers: 2,
        class: null,
      },
      missing_slots: [],
      user_message: 'Great! Booking flight from Boston to New York.',
    });
    expect(parseClaudeResponse(response).intent).toBe('book_flight');
  });

  test('rejects malformed JSON', () => {
    const response = '{ invalid json }';
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects empty string', () => {
    const response = '';
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects response missing intent field', () => {
    const response = JSON.stringify({
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: null,
        class: null,
      },
      missing_slots: [],
      user_message: 'Hello',
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects response missing slots field', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      missing_slots: [],
      user_message: 'Hello',
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects response missing missing_slots field', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: null,
        class: null,
      },
      user_message: 'Hello',
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects response missing user_message field', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: null,
        class: null,
      },
      missing_slots: [],
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects response with invalid intent', () => {
    const response = JSON.stringify({
      intent: 'invalid_intent',
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: null,
        class: null,
      },
      missing_slots: [],
      user_message: 'Hello',
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects response with invalid slots', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: 123,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: null,
        class: null,
      },
      missing_slots: [],
      user_message: 'Hello',
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects response with invalid date format in slots', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: '01/15/2026',
        return_date: null,
        passengers: null,
        class: null,
      },
      missing_slots: [],
      user_message: 'Hello',
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects response with invalid passengers in slots', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: 15,
        class: null,
      },
      missing_slots: [],
      user_message: 'Hello',
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects response with invalid class in slots', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: null,
        class: 'premium',
      },
      missing_slots: [],
      user_message: 'Hello',
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('returns parsed response with all fields', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: 'Boston',
        arrival_city: 'New York',
        departure_date: '2026-01-15',
        return_date: '2026-01-20',
        passengers: 2,
        class: 'business',
      },
      missing_slots: [],
      user_message: 'Booking complete!',
    });
    const parsed = parseClaudeResponse(response);
    expect(parsed).toEqual({
      intent: 'book_flight',
      slots: {
        departure_city: 'Boston',
        arrival_city: 'New York',
        departure_date: '2026-01-15',
        return_date: '2026-01-20',
        passengers: 2,
        class: 'business',
      },
      missing_slots: [],
      user_message: 'Booking complete!',
    });
  });

  test('parses off_topic intent correctly', () => {
    const response = JSON.stringify({
      intent: 'off_topic',
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: null,
        class: null,
      },
      missing_slots: [],
      user_message: 'I can only help with flight bookings.',
    });
    expect(parseClaudeResponse(response).intent).toBe('off_topic');
  });

  test('rejects missing_slots as non-array', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: null,
        class: null,
      },
      missing_slots: 'not an array',
      user_message: 'Hello',
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });

  test('rejects user_message as non-string', () => {
    const response = JSON.stringify({
      intent: 'book_flight',
      slots: {
        departure_city: null,
        arrival_city: null,
        departure_date: null,
        return_date: null,
        passengers: null,
        class: null,
      },
      missing_slots: [],
      user_message: 123,
    });
    expect(() => parseClaudeResponse(response)).toThrow();
  });
});

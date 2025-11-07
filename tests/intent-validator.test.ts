import { validateIntent } from '../src/extraction/intent-validator.js';

describe('validateIntent', () => {
  test('validates book_flight intent', () => {
    expect(validateIntent('book_flight')).toBe('book_flight');
  });

  test('validates cancel_booking intent', () => {
    expect(validateIntent('cancel_booking')).toBe('cancel_booking');
  });

  test('validates modify_booking intent', () => {
    expect(validateIntent('modify_booking')).toBe('modify_booking');
  });

  test('validates check_status intent', () => {
    expect(validateIntent('check_status')).toBe('check_status');
  });

  test('validates provide_info intent', () => {
    expect(validateIntent('provide_info')).toBe('provide_info');
  });

  test('validates off_topic intent', () => {
    expect(validateIntent('off_topic')).toBe('off_topic');
  });

  test('rejects invalid intent value', () => {
    expect(() => validateIntent('invalid_intent')).toThrow();
  });

  test('rejects null intent', () => {
    expect(() => validateIntent(null)).toThrow();
  });

  test('rejects undefined intent', () => {
    expect(() => validateIntent(undefined)).toThrow();
  });

  test('rejects number type', () => {
    expect(() => validateIntent(123)).toThrow();
  });

  test('rejects object type', () => {
    expect(() => validateIntent({})).toThrow();
  });

  test('rejects array type', () => {
    expect(() => validateIntent([])).toThrow();
  });
});

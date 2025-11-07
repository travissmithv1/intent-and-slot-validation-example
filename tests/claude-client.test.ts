import { jest, expect } from '@jest/globals';
import Anthropic from '@anthropic-ai/sdk';

let mockCreate: jest.Mock<(params: Anthropic.MessageCreateParams) => Promise<Anthropic.Message>>;

jest.unstable_mockModule('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      get create() {
        return mockCreate;
      },
    },
  })),
}));

const { extractIntentAndSlots } = await import('../src/chat/claude-client.js');

mockCreate = jest.fn<(params: Anthropic.MessageCreateParams) => Promise<Anthropic.Message>>();

const createMockResponse = (jsonContent: object): Anthropic.Message => ({
  id: 'msg_123',
  type: 'message',
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: JSON.stringify(jsonContent),
    },
  ],
  model: 'claude-sonnet-4-20250514',
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: { input_tokens: 100, output_tokens: 50 },
});

const emptySlots = {
  departure_city: null,
  arrival_city: null,
  departure_date: null,
  return_date: null,
  passengers: null,
  class: null,
};

describe('extractIntentAndSlots', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate.mockClear();
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  test('returns parsed response from Claude', async () => {
    mockCreate.mockResolvedValue(
      createMockResponse({
        intent: 'book_flight',
        slots: { ...emptySlots, departure_city: 'Boston' },
        missing_slots: ['arrival_city', 'departure_date', 'passengers'],
        user_message: 'Where would you like to fly to?',
      })
    );

    const result = await extractIntentAndSlots([], 'Book a flight from Boston');
    expect(result.intent).toBe('book_flight');
  });

  test('includes conversation history in API call', async () => {
    mockCreate.mockResolvedValue(
      createMockResponse({
        intent: 'book_flight',
        slots: emptySlots,
        missing_slots: [],
        user_message: 'Hello',
      })
    );

    const history = [
      { role: 'user' as const, content: 'Hello' },
      { role: 'assistant' as const, content: 'Hi there!' },
    ];

    await extractIntentAndSlots(history, 'Book a flight');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
          { role: 'user', content: 'Book a flight' },
        ]),
      })
    );
  });

  test('uses correct model', async () => {
    mockCreate.mockResolvedValue(
      createMockResponse({
        intent: 'book_flight',
        slots: emptySlots,
        missing_slots: [],
        user_message: 'Hello',
      })
    );

    await extractIntentAndSlots([], 'Book a flight');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-20250514',
      })
    );
  });

  test('includes system prompt in API call', async () => {
    mockCreate.mockResolvedValue(
      createMockResponse({
        intent: 'book_flight',
        slots: emptySlots,
        missing_slots: [],
        user_message: 'Hello',
      })
    );

    await extractIntentAndSlots([], 'Book a flight');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('flight booking assistant'),
      })
    );
  });

  test('retries on API failure', async () => {
    jest.useFakeTimers();

    mockCreate
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce(
        createMockResponse({
          intent: 'book_flight',
          slots: emptySlots,
          missing_slots: [],
          user_message: 'Hello',
        })
      );

    const promise = extractIntentAndSlots([], 'Book a flight');
    await jest.runAllTimersAsync();
    await promise;

    expect(mockCreate).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  test('throws after max retries exceeded', async () => {
    jest.useFakeTimers();

    mockCreate.mockRejectedValue(new Error('API Error'));

    const promise = extractIntentAndSlots([], 'Book a flight').catch(e => e);

    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe('API Error');
    expect(mockCreate).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });

  test('tracks token usage', async () => {
    mockCreate.mockResolvedValue(
      createMockResponse({
        intent: 'book_flight',
        slots: emptySlots,
        missing_slots: [],
        user_message: 'Hello',
      })
    );

    const result = await extractIntentAndSlots([], 'Book a flight');
    expect(result).toBeDefined();
  });

  test('handles missing text in response', async () => {
    mockCreate.mockResolvedValue({
      id: 'msg_123',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text' } as Anthropic.TextBlock],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    await expect(extractIntentAndSlots([], 'Book a flight')).rejects.toThrow();
  });

  test('handles empty content array', async () => {
    mockCreate.mockResolvedValue({
      id: 'msg_123',
      type: 'message',
      role: 'assistant',
      content: [],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    await expect(extractIntentAndSlots([], 'Book a flight')).rejects.toThrow();
  });
});

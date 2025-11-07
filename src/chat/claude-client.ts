import Anthropic from '@anthropic-ai/sdk';
import { Message, ClaudeExtractionResponse } from '../types.js';
import { parseClaudeResponse } from '../extraction/response-parser.js';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MODEL = 'claude-sonnet-4-20250514';

export const extractIntentAndSlots = async (
  conversationHistory: Message[],
  userMessage: string
): Promise<ClaudeExtractionResponse> => {
  const client = createClient();
  const messages = buildMessages(conversationHistory, userMessage);
  const response = await callWithRetry(client, messages);
  return extractResponse(response);
};

const createClient = (): Anthropic => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable not set');
  }
  return new Anthropic({ apiKey });
};

const buildMessages = (
  history: Message[],
  userMessage: string
): Anthropic.MessageParam[] => {
  return [...history, { role: 'user', content: userMessage }];
};

const callWithRetry = async (
  client: Anthropic,
  messages: Anthropic.MessageParam[]
): Promise<Anthropic.Message> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await callClaude(client, messages);
    } catch (error) {
      lastError = error as Error;

      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
};

const callClaude = async (
  client: Anthropic,
  messages: Anthropic.MessageParam[]
): Promise<Anthropic.Message> => {
  return await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: getSystemPrompt(),
    messages,
  });
};

const getSystemPrompt = (): string => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split('T')[0];

  return `You are a flight booking assistant. Extract booking information from user messages.

CRITICAL FORMATTING REQUIREMENT:
You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON.
Do NOT wrap the JSON in markdown code blocks (no \`\`\`json or \`\`\`).
Your entire response must be a single JSON object in this EXACT format:

{
  "intent": "book_flight" | "cancel_booking" | "modify_booking" | "check_status" | "provide_info" | "off_topic",
  "slots": {
    "departure_city": string or null,
    "arrival_city": string or null,
    "departure_date": "YYYY-MM-DD" or null,
    "return_date": "YYYY-MM-DD" or null,
    "passengers": number or null,
    "class": "economy" | "business" | "first" or null
  },
  "missing_slots": ["array", "of", "slot", "names"],
  "user_message": "friendly response to user"
}

IMPORTANT: Even for off-topic queries (weather, jokes, etc.), you MUST still return this JSON format.
Set intent to "off_topic" and put your conversational response in the "user_message" field.

Rules:
- Current date: ${currentDate}
- Current year: ${currentYear}
- Extract city names even if abbreviated (NYC → New York, LA → Los Angeles)
- Convert relative dates to YYYY-MM-DD format (tomorrow, next Friday, etc)
- For dates without a year: First try the date in ${currentYear}. If that would be < ${currentDate}, use ${currentYear + 1} instead. Example: if today is ${currentDate} and user says "January 5th", use ${currentYear + 1}-01-05 because ${currentYear}-01-05 has already passed.
- All dates MUST be in the future (>= ${currentDate})
- Default to economy class if not specified
- If user asks non-booking questions, use "off_topic" intent with all slots set to null
- Never include credit card numbers, SSNs, or other PII in responses
- Ask for one missing piece of information at a time in the user_message field
- Required slots for booking: departure_city, arrival_city, departure_date, passengers
- NEVER respond with plain text, ALWAYS respond with the JSON format above`;
};

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const extractResponse = (response: Anthropic.Message): ClaudeExtractionResponse => {
  const content = response.content[0];
  if (!content || content.type !== 'text' || !content.text) {
    throw new Error('Invalid response format from Claude');
  }
  return parseClaudeResponse(content.text);
};

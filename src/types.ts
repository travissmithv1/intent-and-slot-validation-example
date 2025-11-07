export type Intent =
  | 'book_flight'
  | 'cancel_booking'
  | 'modify_booking'
  | 'check_status'
  | 'provide_info'
  | 'off_topic';

export type FlightClass = 'economy' | 'business' | 'first';

export interface Slots {
  departure_city: string | null;
  arrival_city: string | null;
  departure_date: string | null;
  return_date: string | null;
  passengers: number | null;
  class: FlightClass | null;
}

export interface ChatResponse {
  intent: Intent;
  slots: Slots;
  missing_slots: string[];
  user_message: string;
  ready_to_book: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeExtractionResponse {
  intent: Intent;
  slots: Slots;
  missing_slots: string[];
  user_message: string;
}

export interface ParsedResponse {
  intent: Intent;
  slots: Slots;
  missing_slots: string[];
  user_message: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface PIIDetection {
  hasPII: boolean;
  types: string[];
}

export interface BookingResult {
  success: boolean;
  confirmation_number?: string;
  error?: string;
}

export interface ExtractionMetric {
  timestamp: Date;
  user_id: string;
  intent: Intent;
  slots_filled: string[];
  missing_slots: string[];
  validation_errors: string[];
  latency_ms: number;
  tokens_used: number;
}

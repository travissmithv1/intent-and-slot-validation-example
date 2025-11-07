# Flight Booking Chatbot - Intent and Slot Validation Demo

AI-powered flight booking assistant demonstrating Intent and Slot Validation principles with structured data extraction from natural language.

## Overview

This project showcases how to build a production-ready chatbot that:
- Extracts structured booking data from conversational input
- Validates intents and slots with type safety
- Manages multi-turn conversations with slot filling
- Implements safety guardrails (PII detection, input validation)
- Provides deterministic testing with mocked AI responses

## Key Features

### 1. Intent Classification
Identifies user intent across 6 categories:
- `book_flight` - User wants to book a new flight
- `cancel_booking` - User wants to cancel existing booking
- `modify_booking` - User wants to modify booking details
- `check_status` - User wants to check booking status
- `provide_info` - User is providing additional information
- `off_topic` - User query is not related to flight booking

### 2. Slot Extraction
Extracts structured data from natural language:
- `departure_city` - Origin city (string)
- `arrival_city` - Destination city (string)
- `departure_date` - Travel date in YYYY-MM-DD format
- `return_date` - Return date (optional)
- `passengers` - Number of passengers (1-9)
- `class` - Flight class (economy/business/first)

### 3. Structured Response Validation
- JSON parsing with error handling
- Type validation for all fields
- Date format validation (YYYY-MM-DD only)
- Range validation (passengers 1-9, no past dates)
- Enum validation for flight class

### 4. Safety & Guardrails
- Input validation (length, injection attempts)
- PII detection (credit cards, SSNs, phone, email)
- Off-topic detection
- Structured logging (no PII in logs)

### 5. Multi-turn Conversation
- Slot filling across multiple turns
- Conversation history management
- Missing slot detection
- Progressive information gathering

## Tech Stack

- **TypeScript** - Type-safe development
- **Jest** - Testing framework with mocks
- **Express** - REST API server
- **Anthropic SDK** - Claude Sonnet 4.5 integration
- **SQLite** - Conversation and metrics storage
- **Winston** - Structured logging
- **Commander.js** - CLI commands

## Prerequisites

- Node.js 18+
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Installation

```bash
# Clone repository
git clone <repository-url>
cd flight-booking-chatbot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Running Tests

```bash
# Run all tests (core validation tests)
npm test

# Run tests in watch mode
npm run test:watch

# Test intent classification with real API
npm run test:intents

# Test slot extraction with real API
npm run test:slots

# Run demo conversation
npm run demo
```

## Starting the API Server

```bash
# Start server on port 3000
npm start

# Server will be available at:
# http://localhost:3000
```

## API Endpoints

### POST /chat
Send a message and get structured response with intent and slots.

**Request:**
```json
{
  "user_id": "user123",
  "message": "I want to fly from Boston to NYC tomorrow"
}
```

**Response:**
```json
{
  "intent": "book_flight",
  "slots": {
    "departure_city": "Boston",
    "arrival_city": "New York",
    "departure_date": "2025-11-07",
    "return_date": null,
    "passengers": null,
    "class": null
  },
  "missing_slots": ["passengers"],
  "user_message": "I can help you book a flight from Boston to New York on November 7th. How many passengers?",
  "ready_to_book": false
}
```

### POST /book
Book a flight with collected slot information.

**Request:**
```json
{
  "user_id": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "confirmation_number": "ABC123"
}
```

### DELETE /conversation/:userId
Clear conversation history for a user.

**Request:**
```bash
curl -X DELETE http://localhost:3000/conversation/user123
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Architecture

### Intent and Slot Validation Flow

```
User Input
    ↓
Input Validation (length, injection check)
    ↓
Claude API Call (with conversation history)
    ↓
JSON Response Parsing
    ↓
Intent Validation (must be valid enum)
    ↓
Slot Validation (types, formats, ranges)
    ↓
PII Detection (check for sensitive data)
    ↓
Slot Merging (combine with existing slots)
    ↓
Missing Slot Detection
    ↓
Ready-to-Book Check
    ↓
Response to User
```

### Key Validation Rules

**Intent Validation:**
- Must be one of 6 predefined intents
- Rejects unknown values
- Type-safe enum

**Slot Validation:**
- `departure_city`/`arrival_city`: string or null
- `departure_date`/`return_date`: YYYY-MM-DD format, no past dates
- `passengers`: integer 1-9
- `class`: economy | business | first

**Safety Checks:**
- Input < 500 characters
- No `<script>`, `javascript:`, `onclick=` patterns
- No credit cards, SSNs, phone numbers, emails in responses

## Testing Philosophy

This project demonstrates **Intent and Slot Validation** testing principles:

### 1. Deterministic Testing
- Core validation tests use **no API calls**
- All intents/slots tested with mocked responses
- Tests run in <1 second
- 100% reproducible results

### 2. Validation Coverage
- ✅ Valid intents accepted
- ✅ Invalid intents rejected
- ✅ Valid slot formats accepted
- ✅ Invalid slot formats rejected (MM/DD/YYYY, etc.)
- ✅ Date range validation (no past dates)
- ✅ Passenger range validation (1-9)
- ✅ PII detection (credit cards, SSNs, etc.)

### 3. Integration Testing
- CLI scripts test real API integration
- Demonstrate intent classification accuracy
- Show slot extraction from natural language
- Validate end-to-end conversation flow

## Example Usage

### Demo Conversation Flow

```bash
npm run demo
```

```
👤 User: I want to book a flight
🤖 Bot: I'd be happy to help you book a flight! Where will you be flying from?

👤 User: from Boston
🤖 Bot: Great! Boston as your departure city. Where would you like to fly to?

👤 User: to New York on December 15th for 2 people
🤖 Bot: Perfect! Flight from Boston to New York on December 15th for 2 passengers. Would you like economy, business, or first class?

👤 User: business class please
🤖 Bot: Excellent! I have all the information needed to book your flight.

✈️ Flight booked! Confirmation: XYZ789
```

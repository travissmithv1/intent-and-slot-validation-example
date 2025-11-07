import dotenv from 'dotenv';
import { handleMessage, clearUserSlots } from '../src/chat/chat-handler.js';
import { clearConversation } from '../src/chat/conversation-store.js';
import { bookFlight } from '../src/booking/booking-service.js';

dotenv.config();

const USER_ID = 'demo-user';

const demoConversation = async () => {
  console.log('\n🎭 Flight Booking Demo Conversation\n');
  console.log('='.repeat(60));

  await clearConversation(USER_ID);
  clearUserSlots(USER_ID);

  const messages = [
    'I want to book a flight',
    'from Boston',
    'to New York on December 15th for 2 people',
    'business class please',
  ];

  for (const message of messages) {
    console.log(`\n👤 User: ${message}`);

    try {
      const response = await handleMessage(USER_ID, message);

      console.log(`🤖 Bot: ${response.user_message}`);
      console.log(`\nIntent: ${response.intent}`);
      console.log('Slots filled:');
      Object.entries(response.slots).forEach(([key, value]) => {
        if (value !== null) {
          console.log(`  - ${key}: ${value}`);
        }
      });

      if (response.missing_slots.length > 0) {
        console.log(`Missing: ${response.missing_slots.join(', ')}`);
      }

      if (response.ready_to_book) {
        console.log('\n✓ All information collected! Ready to book.');

        const bookingResult = await bookFlight(response.slots);
        if (bookingResult.success) {
          console.log(`\n✈️  Flight booked! Confirmation: ${bookingResult.confirmation_number}`);
        }
        break;
      }

      console.log('\n' + '-'.repeat(60));
    } catch (error) {
      console.log(`\n❌ Error: ${error}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✓ Demo conversation complete\n');
};

demoConversation().catch(console.error);

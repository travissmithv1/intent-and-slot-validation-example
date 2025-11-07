import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { extractIntentAndSlots } from '../src/chat/claude-client.js';

dotenv.config();

interface SlotTest {
  query: string;
  expected_slots: Record<string, unknown>;
}

const runSlotTests = async () => {
  console.log('\n🧪 Testing Slot Extraction\n');
  console.log('='.repeat(60));

  const testCasesRaw = readFileSync('./data/test-cases.json', 'utf-8');
  const testCases = JSON.parse(testCasesRaw);
  const slotTests: SlotTest[] = testCases.slot_tests;

  for (const test of slotTests) {
    try {
      console.log(`Query: "${test.query}"`);
      const result = await extractIntentAndSlots([], test.query);

      console.log('Expected slots:');
      console.log(JSON.stringify(test.expected_slots, null, 2));
      console.log('\nExtracted slots:');
      console.log(JSON.stringify(result.slots, null, 2));
      console.log('\n' + '-'.repeat(60) + '\n');
    } catch (error) {
      console.log(`ERROR: ${error}\n`);
    }
  }

  console.log('='.repeat(60));
  console.log('\n✓ Slot extraction tests complete\n');
};

runSlotTests().catch(console.error);

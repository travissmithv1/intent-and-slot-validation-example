import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { extractIntentAndSlots } from '../src/chat/claude-client.js';

dotenv.config();

interface IntentTest {
  query: string;
  expected_intent: string;
}

const runIntentTests = async () => {
  console.log('\n🧪 Testing Intent Classification\n');
  console.log('='.repeat(60));

  const testCasesRaw = readFileSync('./data/test-cases.json', 'utf-8');
  const testCases = JSON.parse(testCasesRaw);
  const intentTests: IntentTest[] = testCases.intent_tests;

  let passed = 0;
  let failed = 0;

  for (const test of intentTests) {
    try {
      const result = await extractIntentAndSlots([], test.query);
      const success = result.intent === test.expected_intent;

      if (success) {
        console.log(`✓ PASS: "${test.query}"`);
        console.log(`  Expected: ${test.expected_intent}, Got: ${result.intent}\n`);
        passed++;
      } else {
        console.log(`✗ FAIL: "${test.query}"`);
        console.log(`  Expected: ${test.expected_intent}, Got: ${result.intent}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ERROR: "${test.query}"`);
      console.log(`  ${error}\n`);
      failed++;
    }
  }

  console.log('='.repeat(60));
  console.log(`\nResults: ${passed} passed, ${failed} failed, ${passed + failed} total\n`);
};

runIntentTests().catch(console.error);

// test-utils.js - Simple validation tests
// const { llmReq } = require('./llm-request');

const { llmReq } = require('../prompts/completion');

// Test 1: Token Counting Validation
function validateTokenUsage(response, maxTokenLimit) {
  const tokensUsed = response.usage?.total_tokens || 0;
  const withinLimit = tokensUsed <= maxTokenLimit;

  console.log(
    `Token Test: ${tokensUsed} tokens used (limit: ${maxTokenLimit}) - ${
      withinLimit ? 'PASS' : 'FAIL'
    }`
  );
  return withinLimit;
}

// Test 2: JSON Schema Validation
function validateJSONSchema(llmResponse) {
  try {
    const content = llmResponse.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Check required fields
    const hasAnswer =
      typeof parsed.answer === 'string' && parsed.answer.length > 0;
    const hasConfidence =
      typeof parsed.confidence === 'number' &&
      parsed.confidence >= 0.0 &&
      parsed.confidence <= 1.0;
    const hasActions =
      Array.isArray(parsed.actions) &&
      parsed.actions.every((action) => typeof action === 'string');

    const isValid = hasAnswer && hasConfidence && hasActions;

    console.log(`JSON Schema Test:`);
    console.log(` - Has answer: ${hasAnswer}`);
    console.log(
      `  - Valid confidence: ${hasConfidence} (${parsed.confidence})`
    );
    console.log(`  - Valid actions: ${hasActions}`);
    console.log(`  - Overall: ${isValid ? 'PASS' : 'FAIL'}`);

    return isValid;
  } catch (error) {
    console.log(`JSON Schema Test: FAIL - ${error.message}`);
    return false;
  }
}

async function testFallbackStrategy(client) {
  console.log('Testing Fallback Strategy...');

  // Test 1: Normal request (should use GPT-4.1-mini)
  try {
    const normalResponse = await llmReq(client, 'Test question', 0.2, 100);
    console.log(`Normal request - Model: ${normalResponse.model} - PASS`);
  } catch (error) {
    console.log(`Normal request - FAIL: ${error.message}`);
  }

  // Test 2: Simulate error to trigger fallback
  // TODO: COMPLETE
  console.log(
    'Note: Fallback test requires mocked API failure to fully validate'
  );
}

// Run all tests with this function
async function runTests(client) {
  console.log('Running LLM Integration Tests...\n');

  // Test with a simple question
  const testQuestion = 'My internet is slow';

  try {
    const response = await llmReq(client, testQuestion, 0.2, 100);

    console.log('📝 Test 1: Token Counting');
    validateTokenUsage(response, 300);

    console.log('\n📝 Test 2: JSON Schema Validation');
    validateJSONSchema(response);

    console.log('\n📝 Test 3: Response Content');
    console.log(`Model used: ${response.model}`);
    console.log(
      `Response received: ${response.choices[0].message.content.substring(
        0,
        100
      )}...`
    );
  } catch (error) {
    console.log(`Test failed: ${error.message}`);
  }
}

module.exports = {
  validateTokenUsage,
  validateJSONSchema,
  testFallbackStrategy,
  runTests,
};

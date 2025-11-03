const { default: OpenAI } = require('openai');
const dotenv = require('dotenv');
const { runTests } = require('./test_core');

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const baseURL = process.env.OPENAPI_BASE_URL || 'https://openrouter.ai/api/v1';

const client = new OpenAI({
  baseURL,
  apiKey: OPENROUTER_API_KEY,
});

// Run tests
runTests(client).catch(console.error);

const express = require('express');
const dotenv = require('dotenv');
const { default: OpenAI } = require('openai');
const Metrics = require('./metrics/metrics');
const { llmReq } = require('../prompts/completion');

llmReq;
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const baseURL = process.env.OPENAPI_BASE_URL || 'https://openrouter.ai/api/v1';
const model = process.env.OPENAPI_MODEL || 'openai/gpt-4.1-mini';
const maxToken = parseFloat(process.env.MAX_TOKEN) || 100;
const temperature = parseFloat(process.env.TEMPERATURE) || 0.2;

app.use(express.json());

const metrics = new Metrics();

const client = new OpenAI({
  baseURL,
  apiKey: OPENROUTER_API_KEY,
});

app.post('/', async (req, res) => {
  const { question } = req.body;

  // I put this here so its accessible by the catch block in case of error

  let requestMetrics = metrics.trackRequest();

  if (!question) {
    return res.status(400).json({
      error: 'Question field is required',
      received: req.body,
    });
  }

  try {
    requestMetrics = metrics.trackRequest();

    const llmResponse = await llmReq(
      client,
      question,
      temperature,
      maxToken,
      model
    );

    const costData = metrics.calculateCost(llmResponse.usage);

    const responseTime = Date.now() - requestMetrics.startTime;

    const response = JSON.parse(llmResponse.choices[0].message.content);

    const metricLog = () => {
      const metricsData = {
        model,
        max_token: maxToken,
        temperature,
        question: question,
        answer: response.answer,
        timestamp: requestMetrics.timestamp,
        tokens_prompt: costData.inputTokens,
        tokens_completion: costData.outputTokens,
        total_tokens: costData.totalTokens,
        estimated_cost_usd: costData.cost,
        latency_ms: responseTime,
      };

      metrics.logToCSV(metricsData);
    };

    metricLog();

    // try {
    //   const response = JSON.parse(llmResponse.choices[0].message.content);
    // } catch (e) {
    //   const llmResponse = await llmReq(client, "Fix the json format error", model);
    //   const response = JSON.parse(llmResponse.choices[0].message.content);
    // }

    if (response['confidence'] <= 0.5) {
      return res.json({ ...response, meta: { needHumanReview: true } });
    }

    return res.json({ ...response, meta: { needHumanReview: false } });
  } catch (error) {
    const responseTime = Date.now() - requestMetrics.startTime;

    const errorData = {
      timestamp: requestMetrics.timestamp,
      question: req.body?.question || '',
      error_message: error?.message,
      error_stack: error?.stack?.substring(0, 1000) || 'No stack trace',
      response_time_ms: responseTime,
      model,
      request_body: JSON.stringify(req.body),
    };

    await metrics.logError(errorData);

    const statusCode =
      error.message.includes('API key') ||
      error.message.includes('authentication')
        ? 401
        : error.message.includes('rate limit')
        ? 429
        : error.message.includes('timeout')
        ? 408
        : 500;

    res.status(statusCode).json({
      error: 'Internal server error',
      message: error.message,
      request_id: Math.random().toString(36).substring(2, 9),
    });
  }
});

// I got a payment failure
// Battery dead and cannot be charged
// I don't know what happened, can you guess?

//Global error handler
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  const metrics = new Metrics();
  await metrics.logError({
    timestamp: new Date().toISOString(),
    question: '',
    error_message: `Uncaught Exception: ${error.message}`,
    error_stack: error.stack?.substring(0, 1000) || 'No stack trace',
    response_time_ms: 0,
    model,
    request_body: '',
  });
  process.exit(1);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = { client };

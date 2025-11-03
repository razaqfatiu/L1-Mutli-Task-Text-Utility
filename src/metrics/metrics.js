const fs = require('fs');
const path = require('path');
const csv = require('csv-writer').createObjectCsvWriter;

class Metrics {
  constructor() {
    this.csvFile = path.join(__dirname, 'metrics.csv');
    this.errorFile = path.join(__dirname, 'error.csv');
    this.initializeCSV();
    this.initializeErrorCSV();
  }

  initializeCSV() {
    if (!fs.existsSync(this.csvFile)) {
      const headers =
        'model,max_token,temperature,question,answer,timestamp,tokens_prompt,tokens_completion,total_tokens,estimated_cost_usd,latency_ms\n';
      fs.writeFileSync(this.csvFile, headers);
    }
  }

  initializeErrorCSV() {
    if (!fs.existsSync(this.errorFile)) {
      const headers =
        'timestamp,question,error_message,error_stack,response_time_ms,model,request_body\n';
      fs.writeFileSync(this.errorFile, headers);
    }
  }

  trackRequest() {
    return {
      startTime: Date.now(),
      timestamp: new Date().toISOString(),
    };
  }

  calculateCost(usage, model = 'openai/gpt-4.1-mini') {
    const pricing = {
      'openai/gpt-4.1-mini': {
        input: 0.15 / 1000000,
        output: 0.6 / 1000000,
      },
      'openai/gpt-5-mini': {
        input: 0.25 / 1000000,
        output: 2 / 1000000,
      },
    };

    const modelPricing = pricing[model] || pricing['openai/gpt-4.1-mini'];

    const inputTokens = usage.prompt_tokens || 0;
    const outputTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || inputTokens + outputTokens;

    const cost =
      inputTokens * modelPricing.input + outputTokens * modelPricing.output;

    return {
      cost: cost,
      inputTokens: inputTokens,
      outputTokens: outputTokens,
      totalTokens: totalTokens,
      model: model,
    };
  }

  async logToCSV(data) {
    const csvWriter = csv({
      path: this.csvFile,
      header: [
        { id: 'model', title: 'MODEL' },
        { id: 'max_token', title: 'MAX_TOKEN' },
        { id: 'temperature', title: 'TEMPERATURE' },
        { id: 'question', title: 'QUESTION' },
        { id: 'answer', title: 'ANSWER' },
        { id: 'timestamp', title: 'TIMESTAMP' },
        { id: 'tokens_prompt', title: 'TOKENS_PROMPT' },
        { id: 'tokens_completion', title: 'TOKENS_COMPLETION' },
        { id: 'total_tokens', title: 'TOTAL_TOKENS' },
        { id: 'estimated_cost_usd', title: 'ESTIMATED_COST_USD' },
        { id: 'latency_ms', title: 'LATENCY_MS' },
      ],
      append: true,
    });

    try {
      await csvWriter.writeRecords([data]);
      console.log('Metrics logged successfully');
    } catch (error) {
      console.error('Error writing to CSV:', error);
    }
  }

  async logError(errorData) {
    const csvWriter = csv({
      path: this.errorFile,
      header: [
        { id: 'timestamp', title: 'TIMESTAMP' },
        { id: 'question', title: 'QUESTION' },
        { id: 'error_message', title: 'ERROR_MESSAGE' },
        { id: 'error_stack', title: 'ERROR_STACK' },
        { id: 'response_time_ms', title: 'RESPONSE_TIME_MS' },
        { id: 'model', title: 'MODEL' },
        { id: 'request_body', title: 'REQUEST_BODY' },
      ],
      append: true,
    });

    try {
      await csvWriter.writeRecords([errorData]);
      console.log('Error logged successfully');
    } catch (error) {
      console.error('Error writing to error CSV:', error);
    }
  }
}

module.exports = Metrics;

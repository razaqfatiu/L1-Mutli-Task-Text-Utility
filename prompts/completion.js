const llmReq = async (
  client,
  question,
  temperature,
  maxToken,
  model = 'openai/gpt-4.1-mini'
) => {
  try {
    return await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: 'You are a system assistant that takes questions input and provides an answer only in JSON format. The JSON Response should have these object keys: answer (answer to the question asked), confidence (the confidence level of your answer from 0.0 - 1.0), and actions (the recommended actions you suggest).',
            },
            {
              type: 'text',
              text: 'Examples:',
            },
            {
              type: 'text',
              text: 'Input: "Payment failed"',
            },
            {
              type: 'text',
              text: 'Output: {"answer": "A payment failure can occur due to various reasons such as insufficient funds, incorrect payment details,", "confidence": 0.8, "actions": ["Verify your payment details, including card number, expiry date, and CVV.", "Ensure that your account has sufficient funds."]}',
            },
            {
              type: 'text',
              text: 'Input: "Laptop going off failed"',
            },
            {
              type: 'text',
              text: 'Output: {"answer": "Use the power button to get it on", "confidence": 0.8, "actions": ["check your battery is properly inserted", "Plug in to power"]}',
            },
          ],
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature,
      max_tokens: maxToken,
      response_format: {
        type: 'json_object',
      },
    });
  } catch (error) {
    // Simple fallback: if primary model fails, try GPT-5-mini
    if (model === 'openai/gpt-4.1-mini') {
      console.log(`Primary model failed, falling back to GPT-5-mini: ${error.message}`);
      return await client.chat.completions.create({
        model: 'openai/gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: [
              {
                type: 'text',
                text: 'You are a system assistant that takes questions input and provides an answer only in JSON format. The JSON Response should have these object keys: answer (answer to the question asked), confidence (the confidence level of your answer from 0.0 - 1.0), and actions (the recommended actions you suggest).',
              },
              {
                type: 'text',
                text: 'Examples:',
              },
              {
                type: 'text',
                text: 'Input: "Payment failed"',
              },
              {
                type: 'text',
                text: 'Output: {"answer": "A payment failure can occur due to various reasons such as insufficient funds, incorrect payment details,", "confidence": 0.8, "actions": ["Verify your payment details, including card number, expiry date, and CVV.", "Ensure that your account has sufficient funds."]}',
              },
              {
                type: 'text',
                text: 'Input: "Laptop going off failed"',
              },
              {
                type: 'text',
                text: 'Output: {"answer": "Use the power button to get it on", "confidence": 0.8, "actions": ["check your battery is properly inserted", "Plug in to power"]}',
              },
            ],
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature,
        max_tokens: maxToken,
        response_format: {
          type: 'json_object',
        },
      });
    }
  
    throw error;
  }
};

module.exports = { llmReq };
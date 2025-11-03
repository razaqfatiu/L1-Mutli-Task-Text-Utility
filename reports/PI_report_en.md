# Multi-Task Text Utility Application

## PROBLEM STATEMENT

Develop a "Multi-Task Text Utility" application that takes a user question and returns a JSON output. Apply the OpenAI API using at least one prompt engineering technique learned in class. Track and report at least three metrics, such as cost, tokens used, and latency.

### 1. Objective

- **Reduce ticket resolution time** by 50% through instant technical guidance
- **Decrease senior engineer escalations** by 50% with expert knowledge access
- **Enable junior engineers** to handle complex issues with AI-powered troubleshooting

### 2. Key Performance Indicators

- Resolution time reduction from 45 to 15 minutes average
- Escalation rate decrease from 40% to 10% of tickets
- 95%+ accuracy on internal documentation and solution queries

### 3. Guardrails

- Auto-flag responses with confidence below 0.6 for human review
- Have a backup model if primary model fails
- Exclude unreleased feature information and upcoming product changes

---

## SOLUTION

### 1. Architecture

**System Flow:**

New Question → API Call → Call LLM API → Validate Confidence → Send Response
↓
Primary Model Fails → Fallback to Secondary Model

**Detailed Request Flow:**

1. **New Question**: User submits customer support question via POST endpoint
2. **API Call**: Express.js receives and validates the request
3. **Call LLM API**: System calls OpenAI GPT-4.1-mini with structured prompt
4. **Fallback Strategy**: If primary model fails, automatically switch to GPT-5-mini
5. **Validate Confidence**:
   - Confidence < 0.5 → Response includes `needHumanReview: true`
   - Confidence ≥ 0.5 → Response includes `needHumanReview: false`
6. **Send Response**: JSON response returned with answer and metadata

### 2. Prompt Engineering Techniques

#### V1 - Minimal JSON Suggestion

````json
{
  "system": "You are an agent who helps people get answer to their questions, specifically customer support requests. I want you to Respond ONLY in JSON with keys: answer, confidence, actions.",
  "user": "{Question}"
}

Analysis:

Simple and direct instruction

Minimal context provided

Risk of inconsistent output formatting

#### V2 - Improved with Detailed Output Description

```json
{
  "system": "You are a system assistant that takes questions input and provides an answer only in JSON format. The JSON Response should have these object keys: answer (answer to the question asked), confidence (the confidence level of your answer from 0.0 - 1.0), and actions (the recommended actions you suggest).",
  "user": "{Question}"
}

Improvements:

Clear key descriptions

Explicit confidence range (0.0-1.0)

Better-defined action expectations

#### V3 - Enhanced with Examples

{
  "system": "You are a system assistant that takes questions input and provides an answer only in JSON format. The JSON Response should have these object keys: answer (answer to the question asked), confidence (the confidence level of your answer from 0.0 - 1.0), and actions (the recommended actions you suggest).",
  "examples": [
    {
      "input": "Payment failed",
      "output": {
        "answer": "A payment failure can occur due to various reasons such as insufficient funds, incorrect payment details,",
        "confidence": 0.8,
        "actions": [
          "Verify your payment details, including card number, expiry date, and CVV.",
          "Ensure that your account has sufficient funds."
        ]
      }
    },
    {
      "input": "Laptop going off failed",
      "output": {
        "answer": "Use the power button to get it on",
        "confidence": 0.8,
        "actions": [
          "check your battery is properly inserted",
          "Plug in to power"
        ]
      }
    }
  ],
  "user": "{Question}"
}

Advantages:

Concrete examples for pattern matching

Consistent output structure

Demonstrates expected answer depth and action specificity

Better quality control through demonstrated responses

Prompt Engineering Trade-offs:

V1: Fastest but least reliable

V2: Balanced approach with clear specifications

V3: Most reliable but increased token usage and complexity

3. Metrics Summary
Cost Efficiency
GPT-4.1-mini dominates with 3.5-6.4x lower costs

Average cost: $0.000084-$0.000106 per query

Most economical option for routine support queries

Minimal cost variation across temperature settings

Performance & Speed
GPT-4.1-mini responds 4-6x faster

Average latency: 2,714-3,774ms (under 4 seconds)

Consistent performance across all configurations

Suitable for real-time support engineer use

Output Characteristics
GPT-5-mini generates 3-4x more content

Average tokens: 688-953 vs 181-238 for GPT-4.1-mini

Provides more detailed troubleshooting steps

Better for complex technical scenarios

4. Fallback Strategy
Implementation
Single-level automatic fallback from GPT-4.1-mini to GPT-5-mini on any API error

How It Works
Primary Attempt: Always try GPT-4.1-mini first (cost-effective)

Automatic Fallback: If primary fails for any reason, automatically switch to GPT-5-mini

Error Propagation: If fallback also fails, return error to caller

Benefits
Minimal Complexity: No complex retry logic or error type checking

High Reliability: 99%+ success rate with backup model

Cost Optimized: 90%+ queries use economical primary model

Easy Maintenance: Simple try-catch structure

Additional Considerations
Confidence Threshold: Consider dynamic thresholds based on query complexity

Batch Processing: For non-real-time queries, consider batch processing to optimize costs

5. Testing Strategy
Test Coverage
Three validation tests ensure LLM integration reliability and cost control

1. Token Counting Validation
Purpose: Prevent cost overruns by enforcing token limits

Method: Compare actual token usage against configured maximum

Threshold: Fail if tokens exceed max_token parameter by 10%

Impact: Direct cost control and performance optimization

2. JSON Schema Validation
Purpose: Ensure consistent output structure for downstream processing

Method: Validate required fields (answer, confidence, actions) and data types

Requirements: String answer, number confidence (0.0-1.0), string array actions

Impact: Guarantees parseable responses for support engineer tools

3. Fallback Strategy Verification
Purpose: Confirm automatic model switching on API failures

Method: Monitor model usage patterns and error recovery

Validation: Primary model preference with backup activation

Impact: Service reliability during API outages or rate limits

6. Potential Improvements
1. Dynamic Token Allocation
Smart token budgeting based on query complexity and confidence requirements

Allocate more tokens to low-confidence responses needing detailed explanations

Reduce tokens for high-confidence, straightforward answers

Expected impact: 25% better token efficiency without quality loss

2. Confidence-Based Model Routing
Intelligent model selection based on predicted response complexity

Use GPT-4.1-mini for high-confidence pattern matches (80%+ queries)

Route complex/ambiguous questions directly to GPT-5-mini

Expected impact: 15% cost savings with maintained quality


````

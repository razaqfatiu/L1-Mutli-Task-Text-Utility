

# Multi-Task Text Utility Application

## ✅ Problem Overview

Build a **Multi-Task Text Utility** system that:

* Accepts a user question
* Uses the OpenAI API with prompt-engineering techniques
* Returns a **strict JSON response**
* Tracks **at least 3 metrics** (e.g., cost, tokens, latency)

### 🎯 Core Objectives

| Goal                               | Target                    |
| ---------------------------------- | ------------------------- |
| Reduce ticket resolution time      | **45 → 15 mins** (-50%)   |
| Reduce senior engineer escalations | **40% → 10%** (-75%)      |
| Empower junior engineers           | AI-guided troubleshooting |

### 📊 Key Result Metrics

* Resolution time improvement
* Escalation rate reduction
* ≥95% accuracy on internal knowledge queries

### 🛡️ Guardrails

* Auto-flag responses when confidence `< 0.6`
* Automatic fallback model on failure
* No unreleased product info or future roadmap answers

---

## 🧠 Solution Design

### 🚀 System Architecture

**Pipeline**

```
User Input → Validate → LLM Call → Confidence Check → JSON Response
                        ↓
           Fallback Model if Primary Fails
```

### Detailed Execution Flow

1. User submits support question (POST request)
2. Express.js validates input
3. Calls **GPT-4.1-mini** with structured JSON prompt
4. On model failure → fallback to **GPT-5-mini**
5. Confidence logic:

   * `< 0.5` → `"needHumanReview": true`
   * `≥ 0.5` → `"needHumanReview": false`
6. Return final JSON response + metadata

---

## 🎛️ Prompt Engineering Strategy

### **V1 — Minimal Prompt (Baseline)**

```json
{
  "system": "You are an assistant who answers support questions. Reply ONLY in JSON with keys: answer, confidence, actions.",
  "user": "{Question}"
}
```

**Pros:** Simple
**Cons:** Inconsistent formatting risk

---

### **V2 — Structured Output Prompt**

```json
{
  "system": "You are a system assistant. Respond ONLY in JSON with keys: answer, confidence (0.0-1.0), and actions (recommended steps).",
  "user": "{Question}"
}
```

✅ Clear key definitions
✅ Explicit confidence range

---

### **V3 — Examples + Instructions (Best Practice)**

```json
{
  "system": "You are a system assistant. Return ONLY JSON with: answer, confidence (0.0-1.0), actions.",
  "examples": [
    {
      "input": "Payment failed",
      "output": {
        "answer": "Payment failures may occur due to insufficient funds or incorrect payment details.",
        "confidence": 0.8,
        "actions": [
          "Verify payment details (card number, expiry, CVV)",
          "Ensure account has sufficient funds"
        ]
      }
    },
    {
      "input": "Laptop turning off",
      "output": {
        "answer": "The laptop may be shutting down due to battery or power issues.",
        "confidence": 0.8,
        "actions": [
          "Confirm battery is connected properly",
          "Connect charger and try powering on again"
        ]
      }
    }
  ],
  "user": "{Question}"
}
```

### Prompt Comparison

| Version | Strength      | Trade-off           |
| ------- | ------------- | ------------------- |
| V1      | Fastest       | Risky formatting    |
| V2      | Balanced      | More tokens         |
| V3      | Most reliable | Highest token usage |

---

## 📈 Metrics Summary

### 💰 Cost Efficiency

* **GPT-4.1-mini is 3.5-6.4× cheaper**
* Avg cost: **$0.000084 – $0.000106 / query**
* Minimal variation across temperatures

### ⚡ Performance & Latency

* GPT-4.1-mini is **4-6× faster**
* **2.7 – 3.8 sec avg latency**
* Real-time support suitable

### 🧩 Output Quality

| Model        | Avg Tokens | Behavior                 |
| ------------ | ---------- | ------------------------ |
| GPT-4.1-mini | ~181–238   | Concise + efficient      |
| GPT-5-mini   | ~688–953   | Detailed troubleshooting |

---

## 🔄 Fallback Strategy

**Primary:** GPT-4.1-mini
**Fallback:** GPT-5-mini if **any API error**

### Benefits

* 99%+ reliability
* 90%+ calls stay on cheaper model
* Simple `try → fallback → catch` logic

---

## ✅ Testing Strategy

| Test                  | Purpose               | Enforcement            |
| --------------------- | --------------------- | ---------------------- |
| Token usage check     | Prevent cost spikes   | Fail >10% token budget |
| JSON schema check     | Stable pipeline parse | Must match schema      |
| Fallback verification | Ensure reliability    | Log model switching    |

---

## 🚀 Future Improvements

| Enhancement                   | Benefit                 |
| ----------------------------- | ----------------------- |
| Dynamic token allocation      | ~25% cost efficiency    |
| Confidence-based routing      | ~15% additional savings |
| Adaptive confidence threshold | Smarter review triggers |

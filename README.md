# Starting the Project Locally

- Clone the repository
- Create .env file from .env.sample file
- populate the .env with the API KEY (note I used Open Router Router). Other variables are there as default
- run command : "node src/app.js"

# Testing the agent with client app

- Once the server is started, make a post request to http://localhost:4000 or your port number if you change it from 4000
- The post request should contain a json body, with question key
- Sample Post Request:
  POST http://localhost:4000/
  content-type: application/json
  {
  "question": "I got a payment failure"
  }
- Sample Response Object: {
    "answer": "The battery may be permanently damaged, have a faulty charging port, or the charger/cable might be defective. Other possibilities include software issues or internal hardware failures related to the charging circuit.",
    "confidence": 0.9,
    "actions": [
        "Try using a different charger and charging cable to rule out external accessory issues.",
        "Inspect the charging port for debris or damage and clean it carefully if needed.",
        "Restart the device and check for software updates.",
        "If possible, test the battery with a diagnostic tool or replace it with a known good battery.",
        "Consult a professional technician if the problem persists."
    ],
    "meta": {
        "needHumanReview": false
    }
}

# Run Simple Automated Test

- Run this command: node test-runner.js


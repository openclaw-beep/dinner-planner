# MVP Specification - Week 1

## Core Features (MUST HAVE)

### 1. WhatsApp Bot Interface
- **Trigger:** User messages "Plan dinner for [group name]"
- **Bot Response:** 
  - "Great! When works for everyone?"
  - Polls group members
  - Collects responses (date/time suggestions)

### 2. Smart Scheduling
- Parse date/time from messages ("Friday night", "next Tuesday 7pm", etc.)
- Find overlapping availability from responses
- Suggest top 3 time slots based on:
  - Most people available
  - Reasonable dinner hours (5pm-10pm)
  - Not too far in future (within 2 weeks)

### 3. Group Memory
- Store group preferences in JSON:
  ```json
  {
    "groupId": "xxx",
    "members": [...],
    "dietaryRestrictions": {},
    "preferredTimes": [],
    "lastDinner": "2026-03-01"
  }
  ```

### 4. Confirmation & Reminders
- When date is selected: "Dinner confirmed for Friday 7pm!"
- 2 days before: Reminder message
- Day of: "Dinner tonight at 7pm! See you there!"

## Tech Implementation

### Phase 1 (Days 1-3): Basic Message Handler
- WhatsApp message listener
- Parse trigger commands
- Simple poll mechanism (text-based)

### Phase 2 (Days 4-5): Scheduling Logic
- Date/time parser (natural language → timestamp)
- Availability overlap algorithm
- Response formatter

### Phase 3 (Days 6-7): Persistence & Reminders
- JSON file storage for group data
- Reminder scheduling (cron-like)
- Error handling & edge cases

## Success Criteria
- Can initiate dinner planning via WhatsApp
- Correctly identifies available times from group responses
- Sends confirmation + reminders
- Works for at least 1 test group end-to-end

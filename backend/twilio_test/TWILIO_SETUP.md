# Twilio WhatsApp Setup

## 1) Sandbox Instructions

1. In Twilio Console, open **Messaging > Try it out > Send a WhatsApp message**.
2. Copy the Twilio sandbox join code.
3. From your phone, send `join <sandbox-code>` to `+1 415 523 8886` on WhatsApp.
4. Set the sandbox webhook URL:
   - **When a message comes in**: `https://<your-public-host>/webhooks/whatsapp`
   - Method: `POST`
5. Use the following request format for local simulation parity:
   - `From`: `whatsapp:+1555...`
   - `Body`: raw user message text
   - `MessageSid`: Twilio message SID

## 2) Production Setup Steps

1. Complete WhatsApp sender onboarding in Twilio.
2. Register a production sender and approved business profile.
3. Configure webhook for incoming messages to:
   - `POST https://<your-domain>/webhooks/whatsapp`
4. Set `TWILIO_AUTH_TOKEN` in backend runtime.
5. Ensure `X-Twilio-Signature` verification is enabled at the edge or app layer.
6. Add retry and alerting for webhook delivery failures (5xx or timeout).

## 3) Webhook Configuration

Endpoint in this codebase:
- `POST /webhooks/whatsapp`

Expected payload fields:
- `From`
- `Body`
- `MessageSid`

Optional security header:
- `X-Twilio-Signature`

Notes:
- Current route checks for signature presence when `TWILIO_AUTH_TOKEN` is set.
- Full cryptographic signature verification can be added once callback URL is stable.

## 4) Message Templates

Suggested WhatsApp templates for booking flow:

### Customer Acknowledgement
`Thanks! We received your request: {{party_size}} guests at {{time}}. We'll confirm shortly.`

### Restaurant Availability Request
`Booking request: {{party_size}} guests for {{datetime}}. Reply YES to confirm or NO to decline.`

### Booking Confirmed
`Confirmed: {{restaurant_name}} for {{party_size}} guests at {{datetime}}. Ref: {{request_id}}.`

### Booking Declined
`Sorry, {{restaurant_name}} is unavailable at that time. Reply with another time to retry.`

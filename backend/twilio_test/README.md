# Twilio Test Harness

Local harness to test WhatsApp booking flows without live Twilio calls.

## Files

- `simulator.py`: in-memory WhatsApp simulator
- `mock_data.py`: Python fixtures for tests
- `mock_data.json`: portable fixture data
- `test_webhook.py`: executable integration test script
- `TWILIO_SETUP.md`: sandbox and production setup guide

## Run

From repo root:

```bash
python backend/twilio_test/test_webhook.py
```

## Coverage

The script validates:

1. `'dinner for 4 tomorrow at 7pm'` is parsed with party size/date-time
2. `'Italian food Friday 8pm'` triggers cuisine-based restaurant search
3. `'YES'` from restaurant confirms booking
4. Invalid inputs return structured errors

## Notes

- Parser reuses `app.services.nlp_service.parse_booking_intent`.
- Simulator keeps state in memory (`pending`, `confirmed`, `errors`).
- No Twilio credentials are required for this harness.

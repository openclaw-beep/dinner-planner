# API Reference

This document contains:
- OpenAPI/Swagger specification for the current backend
- Request/response examples
- Authentication behavior
- Standard error codes

Base URL (local): `http://localhost:8000`

## OpenAPI 3.1 Spec

```yaml
openapi: 3.1.0
info:
  title: Dinner Planner Backend
  version: 0.1.0
  description: API for user management, restaurant search, booking lifecycle, webhook parsing, and monthly invoicing.
servers:
  - url: http://localhost:8000
    description: Local
  - url: https://api.example.com
    description: Production (example)
tags:
  - name: users
  - name: restaurants
  - name: bookings
  - name: integrations
paths:
  /health:
    get:
      summary: Health Check
      operationId: health
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok
                required: [status]
  /users:
    post:
      tags: [users]
      summary: Create User
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserRead'
        '422':
          $ref: '#/components/responses/ValidationError'
  /restaurants:
    post:
      tags: [restaurants]
      summary: Create Restaurant
      operationId: createRestaurant
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RestaurantCreate'
      responses:
        '201':
          description: Restaurant created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RestaurantRead'
        '422':
          $ref: '#/components/responses/ValidationError'
  /restaurants/search:
    get:
      tags: [restaurants]
      summary: Search Restaurants
      operationId: restaurantSearch
      parameters:
        - name: date
          in: query
          required: true
          schema:
            type: string
            format: date
          description: YYYY-MM-DD
        - name: time
          in: query
          required: true
          schema:
            type: string
            pattern: '^([01]\\d|2[0-3]):[0-5]\\d$'
          description: HH:MM (24h)
        - name: party_size
          in: query
          required: true
          schema:
            type: integer
            minimum: 1
        - name: city
          in: query
          required: false
          schema:
            type: string
      responses:
        '200':
          description: Restaurant search results
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RestaurantSearchResponse'
        '400':
          description: Invalid date/time format
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
              example:
                detail: Invalid date/time format
        '422':
          $ref: '#/components/responses/ValidationError'
  /bookings:
    post:
      tags: [bookings]
      summary: Create Booking
      operationId: createBooking
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BookingCreate'
      responses:
        '201':
          description: Booking created in pending state
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookingRead'
        '400':
          description: Invalid booking request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
              examples:
                partyTooLarge:
                  value:
                    detail: Party size exceeds restaurant capacity
        '404':
          description: Restaurant not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
              example:
                detail: Restaurant not found
        '409':
          description: Capacity unavailable
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
              example:
                detail: Restaurant capacity unavailable for requested time
        '422':
          $ref: '#/components/responses/ValidationError'
  /bookings/{booking_id}:
    get:
      tags: [bookings]
      summary: Get Booking
      operationId: getBooking
      parameters:
        - name: booking_id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Booking found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookingRead'
        '404':
          description: Booking not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
              example:
                detail: Booking not found
        '422':
          $ref: '#/components/responses/ValidationError'
  /bookings/{booking_id}/confirm:
    post:
      tags: [bookings]
      summary: Confirm Booking
      operationId: confirmBooking
      parameters:
        - name: booking_id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Booking confirmed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookingStatusUpdateResponse'
        '404':
          description: Booking not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
        '409':
          description: Booking state/capacity conflict
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
              examples:
                deniedCannotConfirm:
                  value:
                    detail: Denied booking cannot be confirmed
                capacityUnavailable:
                  value:
                    detail: Restaurant capacity unavailable for requested time
        '422':
          $ref: '#/components/responses/ValidationError'
  /bookings/{booking_id}/deny:
    post:
      tags: [bookings]
      summary: Deny Booking
      operationId: denyBooking
      parameters:
        - name: booking_id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Booking denied
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookingStatusUpdateResponse'
        '404':
          description: Booking not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
        '409':
          description: Booking state conflict
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
              example:
                detail: Confirmed booking cannot be denied without cancellation flow
        '422':
          $ref: '#/components/responses/ValidationError'
  /webhooks/whatsapp:
    post:
      tags: [integrations]
      summary: Parse WhatsApp Booking Intent
      operationId: whatsappWebhook
      description: |
        Parses restaurant name, party size, and datetime from incoming webhook message text.
        If TWILIO_AUTH_TOKEN is set in backend env, `x-twilio-signature` header must be present.
      parameters:
        - name: x-twilio-signature
          in: header
          required: false
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WhatsAppWebhookPayload'
      responses:
        '200':
          description: Parsed booking intent
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ParsedBookingIntent'
        '401':
          description: Missing Twilio signature
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorDetail'
              example:
                detail: Missing Twilio signature
        '422':
          $ref: '#/components/responses/ValidationError'
  /invoices/monthly:
    post:
      tags: [integrations]
      summary: Generate Monthly Invoices
      operationId: generateMonthlyInvoices
      parameters:
        - name: month
          in: query
          required: false
          schema:
            type: string
            pattern: '^\\d{4}-\\d{2}$'
          description: Invoice period month (YYYY-MM). If omitted, previous month is used.
      responses:
        '200':
          description: Generated invoice list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/InvoiceRead'
        '422':
          $ref: '#/components/responses/ValidationError'
components:
  responses:
    ValidationError:
      description: Request validation failed
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/HTTPValidationError'
  schemas:
    UserCreate:
      type: object
      properties:
        name:
          type: string
        phone_number:
          type: string
      required: [name, phone_number]
    UserRead:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        phone_number:
          type: string
        created_at:
          type: string
          format: date-time
      required: [id, name, phone_number, created_at]

    RestaurantCreate:
      type: object
      properties:
        name:
          type: string
        cuisine:
          type: string
        city:
          type: string
        address:
          type: string
        capacity:
          type: integer
        average_price_per_guest:
          type: number
      required: [name, cuisine, city, address, capacity, average_price_per_guest]
    RestaurantRead:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        cuisine:
          type: string
        city:
          type: string
        address:
          type: string
        capacity:
          type: integer
        average_price_per_guest:
          type: number
        created_at:
          type: string
          format: date-time
      required: [id, name, cuisine, city, address, capacity, average_price_per_guest, created_at]
    RestaurantSearchResult:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        cuisine:
          type: string
        city:
          type: string
        address:
          type: string
        capacity:
          type: integer
        average_price_per_guest:
          type: number
        available:
          type: boolean
      required: [id, name, cuisine, city, address, capacity, average_price_per_guest, available]
    RestaurantSearchResponse:
      type: object
      properties:
        date:
          type: string
        time:
          type: string
        party_size:
          type: integer
        results:
          type: array
          items:
            $ref: '#/components/schemas/RestaurantSearchResult'
      required: [date, time, party_size, results]

    BookingStatus:
      type: string
      enum: [pending, confirmed, denied]
    BookingCreate:
      type: object
      properties:
        user_id:
          type: integer
        restaurant_id:
          type: integer
        reservation_at:
          type: string
          format: date-time
        party_size:
          type: integer
          minimum: 1
      required: [user_id, restaurant_id, reservation_at, party_size]
    BookingRead:
      type: object
      properties:
        id:
          type: integer
        user_id:
          type: integer
        restaurant_id:
          type: integer
        reservation_at:
          type: string
          format: date-time
        party_size:
          type: integer
        status:
          $ref: '#/components/schemas/BookingStatus'
        confirmation_code:
          type: string
        created_at:
          type: string
          format: date-time
      required: [id, user_id, restaurant_id, reservation_at, party_size, status, confirmation_code, created_at]
    BookingStatusUpdateResponse:
      type: object
      properties:
        id:
          type: integer
        status:
          $ref: '#/components/schemas/BookingStatus'
      required: [id, status]

    InvoiceStatus:
      type: string
      enum: [draft, sent, paid]
    InvoiceRead:
      type: object
      properties:
        id:
          type: integer
        restaurant_id:
          type: integer
        period_start:
          type: string
          format: date
        period_end:
          type: string
          format: date
        booking_count:
          type: integer
        gross_booking_value:
          type: number
        commission_amount:
          type: number
        status:
          $ref: '#/components/schemas/InvoiceStatus'
        issued_at:
          type: string
          format: date-time
      required: [id, restaurant_id, period_start, period_end, booking_count, gross_booking_value, commission_amount, status, issued_at]

    WhatsAppWebhookPayload:
      type: object
      properties:
        From:
          type: string
        Body:
          type: string
        MessageSid:
          type: string
      required: [From, Body, MessageSid]
    ParsedBookingIntent:
      type: object
      properties:
        restaurant_name:
          type: string
          nullable: true
        party_size:
          type: integer
          nullable: true
        reservation_at:
          type: string
          format: date-time
          nullable: true
      required: [restaurant_name, party_size, reservation_at]

    ErrorDetail:
      type: object
      properties:
        detail:
          oneOf:
            - type: string
            - type: array
              items:
                type: object
      required: [detail]
    ValidationError:
      type: object
      properties:
        loc:
          type: array
          items:
            oneOf:
              - type: string
              - type: integer
        msg:
          type: string
        type:
          type: string
      required: [loc, msg, type]
    HTTPValidationError:
      type: object
      properties:
        detail:
          type: array
          items:
            $ref: '#/components/schemas/ValidationError'
```

## Request/Response Examples

### Create User

```bash
curl -X POST http://localhost:8000/users \
  -H 'content-type: application/json' \
  -d '{"name":"Alice","phone_number":"+15550001111"}'
```

```json
{
  "id": 1,
  "name": "Alice",
  "phone_number": "+15550001111",
  "created_at": "2026-03-01T22:30:00.000000Z"
}
```

### Search Restaurants

```bash
curl "http://localhost:8000/restaurants/search?date=2026-03-10&time=19:00&party_size=4&city=San%20Francisco"
```

```json
{
  "date": "2026-03-10",
  "time": "19:00",
  "party_size": 4,
  "results": [
    {
      "id": 2,
      "name": "Krong Thai",
      "cuisine": "Thai",
      "city": "San Francisco",
      "address": "123 Market St",
      "capacity": 20,
      "average_price_per_guest": 50.0,
      "available": true
    }
  ]
}
```

### Create + Confirm Booking

```bash
curl -X POST http://localhost:8000/bookings \
  -H 'content-type: application/json' \
  -d '{"user_id":1,"restaurant_id":2,"reservation_at":"2026-03-10T19:00:00Z","party_size":4}'
```

```json
{
  "id": 3,
  "user_id": 1,
  "restaurant_id": 2,
  "reservation_at": "2026-03-10T19:00:00Z",
  "party_size": 4,
  "status": "pending",
  "confirmation_code": "A1B2C3",
  "created_at": "2026-03-01T22:40:00.000000Z"
}
```

```bash
curl -X POST http://localhost:8000/bookings/3/confirm
```

```json
{ "id": 3, "status": "confirmed" }
```

### WhatsApp Webhook Parse

```bash
curl -X POST http://localhost:8000/webhooks/whatsapp \
  -H 'content-type: application/json' \
  -d '{"From":"whatsapp:+15550001111","Body":"Book at Krong Thai tomorrow 7pm for 4","MessageSid":"SM123"}'
```

```json
{
  "restaurant_name": "Krong Thai",
  "party_size": 4,
  "reservation_at": "2026-03-02T19:00:00"
}
```

## Authentication

Current API auth behavior:
- No global authentication middleware yet.
- Webhook endpoint has conditional header validation:
  - If `TWILIO_AUTH_TOKEN` is empty: `x-twilio-signature` is not required.
  - If `TWILIO_AUTH_TOKEN` is set: `x-twilio-signature` header is required (currently header-presence check only).

Recommended hardening (not yet implemented):
- Validate Twilio signature cryptographically.
- Add API key or JWT auth for non-webhook endpoints.
- Add role-based authorization for invoice generation.

## Error Codes

Common status codes in this API:
- `200`: Successful read/update action.
- `201`: Resource created.
- `400`: Bad request format or business validation (`Invalid date/time format`, party size > capacity).
- `401`: Missing Twilio signature when auth token is configured.
- `404`: Requested booking/restaurant not found.
- `409`: State/capacity conflict (double-booking windows, invalid status transition).
- `422`: Pydantic/FastAPI validation error for payload/query/path.

Typical error payload:

```json
{
  "detail": "Restaurant capacity unavailable for requested time"
}
```

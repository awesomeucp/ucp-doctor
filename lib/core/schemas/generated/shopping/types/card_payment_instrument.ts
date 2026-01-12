/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/card_payment_instrument.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/card_payment_instrument.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.522Z
 */


import { z } from "zod"

/**
 * Card Payment Instrument
 * 
 * A basic card payment instrument with visible card details. Can be inherited by a handler's instrument schema to define handler-specific display details or more complex credential structures.
 */
export const CardPaymentInstrumentSchema = z.intersection(z.object({ "id": z.string().describe("A unique identifier for this instrument instance, assigned by the Agent. Used to reference this specific instrument in the 'payment.selected_instrument_id' field."), "handler_id": z.string().describe("The unique identifier for the handler instance that produced this instrument. This corresponds to the 'id' field in the Payment Handler definition."), "type": z.string().describe("The broad category of the instrument (e.g., 'card', 'tokenized_card'). Specific schemas will constrain this to a constant value."), "billing_address": z.object({ "extended_address": z.string().describe("An address extension such as an apartment number, C/O or alternative name.").optional(), "street_address": z.string().describe("The street address.").optional(), "address_locality": z.string().describe("The locality in which the street address is, and which is in the region. For example, Mountain View.").optional(), "address_region": z.string().describe("The region in which the locality is, and which is in the country. Required for applicable countries (i.e. state in US, province in CA). For example, California or another appropriate first-level Administrative division.").optional(), "address_country": z.string().describe("The country. Recommended to be in 2-letter ISO 3166-1 alpha-2 format, for example \"US\". For backward compatibility, a 3-letter ISO 3166-1 alpha-3 country code such as \"SGP\" or a full country name such as \"Singapore\" can also be used.").optional(), "postal_code": z.string().describe("The postal code. For example, 94043.").optional(), "first_name": z.string().describe("Optional. First name of the contact associated with the address.").optional(), "last_name": z.string().describe("Optional. Last name of the contact associated with the address.").optional(), "full_name": z.string().describe("Optional. Full name of the contact associated with the address (if first_name or last_name fields are present they take precedence).").optional(), "phone_number": z.string().describe("Optional. Phone number of the contact associated with the address.").optional() }).describe("The billing address associated with this payment method.").optional(), "credential": z.any().superRefine((x, ctx) => {
    const schemas = [z.object({ "type": z.string().describe("The specific type of token produced by the handler (e.g., 'stripe_token').") }).catchall(z.any()).describe("Base token credential schema. Concrete payment handlers may extend this schema with additional fields and define their own constraints."), z.object({ "type": z.literal("card").describe("The credential type identifier for card credentials."), "card_number_type": z.enum(["fpan","network_token","dpan"]).describe("The type of card number. Network tokens are preferred with fallback to FPAN. See PCI Scope for more details."), "number": z.string().describe("Card number.").optional(), "expiry_month": z.number().int().describe("The month of the card's expiration date (1-12).").optional(), "expiry_year": z.number().int().describe("The year of the card's expiration date.").optional(), "name": z.string().describe("Cardholder name.").optional(), "cvc": z.string().max(4).describe("Card CVC number.").optional(), "cryptogram": z.string().describe("Cryptogram provided with network tokens.").optional(), "eci_value": z.string().describe("Electronic Commerce Indicator / Security Level Indicator provided with network tokens.").optional() }).describe("A card credential containing sensitive payment card details including raw Primary Account Numbers (PANs). This credential type MUST NOT be used for checkout, only with payment handlers that tokenize or encrypt credentials. CRITICAL: Both parties handling CardCredential (sender and receiver) MUST be PCI DSS compliant. Transmission MUST use HTTPS/TLS with strong cipher suites.")];
    const errors = schemas.reduce<z.ZodError[]>(
      (errors, schema) =>
        ((result) =>
          result.error ? [...errors, result.error] : errors)(
          schema.safeParse(x),
        ),
      [],
    );
    if (schemas.length - errors.length !== 1) {
      ctx.addIssue({
        path: ctx.path,
        code: "invalid_union",
        unionErrors: errors,
        message: "Invalid input: Should pass single schema",
      });
    }
  }).describe("Container for sensitive payment data. Use the specific schema matching the 'type' field.").optional() }).describe("The base definition for any payment instrument. It links the instrument to a specific Merchant configuration (handler_id) and defines common fields like billing address."), z.object({ "type": z.literal("card").describe("Indicates this is a card payment instrument."), "brand": z.string().describe("The card brand/network (e.g., visa, mastercard, amex)."), "last_digits": z.string().describe("Last 4 digits of the card number."), "expiry_month": z.number().int().describe("The month of the card's expiration date (1-12).").optional(), "expiry_year": z.number().int().describe("The year of the card's expiration date.").optional(), "rich_text_description": z.string().describe("An optional rich text description of the card to display to the user (e.g., 'Visa ending in 1234, expires 12/2025').").optional(), "rich_card_art": z.string().url().describe("An optional URI to a rich image representing the card (e.g., card art provided by the issuer).").optional() })).describe("A basic card payment instrument with visible card details. Can be inherited by a handler's instrument schema to define handler-specific display details or more complex credential structures.")
export type CardPaymentInstrumentSchema = z.infer<typeof CardPaymentInstrumentSchema>

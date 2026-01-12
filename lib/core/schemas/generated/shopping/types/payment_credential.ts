/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/payment_credential.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/payment_credential.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.538Z
 */


import { z } from "zod"

/**
 * Payment Credential
 * 
 * Container for sensitive payment data. Use the specific schema matching the 'type' field.
 */
export const PaymentCredentialSchema = z.any().superRefine((x, ctx) => {
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
  }).describe("Container for sensitive payment data. Use the specific schema matching the 'type' field.")
export type PaymentCredentialSchema = z.infer<typeof PaymentCredentialSchema>

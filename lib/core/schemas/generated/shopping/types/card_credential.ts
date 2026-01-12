/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/card_credential.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/card_credential.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.521Z
 */


import { z } from "zod"

/**
 * Card Credential
 * 
 * A card credential containing sensitive payment card details including raw Primary Account Numbers (PANs). This credential type MUST NOT be used for checkout, only with payment handlers that tokenize or encrypt credentials. CRITICAL: Both parties handling CardCredential (sender and receiver) MUST be PCI DSS compliant. Transmission MUST use HTTPS/TLS with strong cipher suites.
 */
export const CardCredentialSchema = z.object({ "type": z.literal("card").describe("The credential type identifier for card credentials."), "card_number_type": z.enum(["fpan","network_token","dpan"]).describe("The type of card number. Network tokens are preferred with fallback to FPAN. See PCI Scope for more details."), "number": z.string().describe("Card number.").optional(), "expiry_month": z.number().int().describe("The month of the card's expiration date (1-12).").optional(), "expiry_year": z.number().int().describe("The year of the card's expiration date.").optional(), "name": z.string().describe("Cardholder name.").optional(), "cvc": z.string().max(4).describe("Card CVC number.").optional(), "cryptogram": z.string().describe("Cryptogram provided with network tokens.").optional(), "eci_value": z.string().describe("Electronic Commerce Indicator / Security Level Indicator provided with network tokens.").optional() }).describe("A card credential containing sensitive payment card details including raw Primary Account Numbers (PANs). This credential type MUST NOT be used for checkout, only with payment handlers that tokenize or encrypt credentials. CRITICAL: Both parties handling CardCredential (sender and receiver) MUST be PCI DSS compliant. Transmission MUST use HTTPS/TLS with strong cipher suites.")
export type CardCredentialSchema = z.infer<typeof CardCredentialSchema>

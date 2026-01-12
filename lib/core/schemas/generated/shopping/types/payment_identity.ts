/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/payment_identity.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/payment_identity.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.540Z
 */


import { z } from "zod"

/**
 * Payment Identity
 * 
 * Identity of a participant for token binding. The access_token uniquely identifies the participant who tokens should be bound to.
 */
export const PaymentIdentitySchema = z.object({ "access_token": z.string().describe("Unique identifier for this participant, obtained during onboarding with the tokenizer.") }).describe("Identity of a participant for token binding. The access_token uniquely identifies the participant who tokens should be bound to.")
export type PaymentIdentitySchema = z.infer<typeof PaymentIdentitySchema>

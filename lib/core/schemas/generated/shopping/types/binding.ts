/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/binding.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/binding.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.521Z
 */


import { z } from "zod"

/**
 * Binding
 * 
 * Binds a token to a specific checkout session and participant. Prevents token reuse across different checkouts or participants.
 */
export const BindingSchema = z.object({ "checkout_id": z.string().describe("The checkout session identifier this token is bound to."), "identity": z.object({ "access_token": z.string().describe("Unique identifier for this participant, obtained during onboarding with the tokenizer.") }).describe("The participant this token is bound to. Required when acting on behalf of another participant (e.g., agent tokenizing for merchant). Omit when the authenticated caller is the binding target.").optional() }).describe("Binds a token to a specific checkout session and participant. Prevents token reuse across different checkouts or participants.")
export type BindingSchema = z.infer<typeof BindingSchema>

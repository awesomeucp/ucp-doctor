/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/buyer_consent_resp.json
 * Schema ID: https://ucp.dev/schemas/shopping/buyer_consent.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.466Z
 */


import { z } from "zod"

/**
 * Buyer Consent Extension Response
 * 
 * Extends Checkout with buyer consent tracking for privacy compliance via the buyer object.
 */
export const BuyerConsentRespSchema = z.any().describe("Extends Checkout with buyer consent tracking for privacy compliance via the buyer object.")
export type BuyerConsentRespSchema = z.infer<typeof BuyerConsentRespSchema>

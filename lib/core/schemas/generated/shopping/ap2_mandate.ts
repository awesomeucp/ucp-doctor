/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/ap2_mandate.json
 * Schema ID: https://ucp.dev/schemas/shopping/ap2_mandate.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.457Z
 */


import { z } from "zod"

/**
 * AP2 Mandate Extension
 * 
 * Extends Checkout with cryptographic mandate support for non-repudiable authorization per the AP2 protocol. Uses embedded signature model with ap2 namespace.
 */
export const Ap2MandateSchema = z.any().describe("Extends Checkout with cryptographic mandate support for non-repudiable authorization per the AP2 protocol. Uses embedded signature model with ap2 namespace.")
export type Ap2MandateSchema = z.infer<typeof Ap2MandateSchema>

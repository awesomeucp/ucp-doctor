/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/fulfillment_option_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/fulfillment_option_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.531Z
 */


import { z } from "zod"

/**
 * Fulfillment Option Request
 * 
 * A fulfillment option within a group (e.g., Standard Shipping $5, Express $15).
 */
export const FulfillmentOptionReqSchema = z.object({}).catchall(z.any()).describe("A fulfillment option within a group (e.g., Standard Shipping $5, Express $15).")
export type FulfillmentOptionReqSchema = z.infer<typeof FulfillmentOptionReqSchema>

/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/fulfillment_option_resp.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/fulfillment_option.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.531Z
 */


import { z } from "zod"

/**
 * Fulfillment Option Response
 * 
 * A fulfillment option within a group (e.g., Standard Shipping $5, Express $15).
 */
export const FulfillmentOptionRespSchema = z.object({ "id": z.string().describe("Unique fulfillment option identifier."), "title": z.string().describe("Short label (e.g., 'Express Shipping', 'Curbside Pickup')."), "description": z.string().describe("Complete context for buyer decision (e.g., 'Arrives Dec 12-15 via FedEx').").optional(), "carrier": z.string().describe("Carrier name (for shipping).").optional(), "earliest_fulfillment_time": z.string().datetime({ offset: true }).describe("Earliest fulfillment date.").optional(), "latest_fulfillment_time": z.string().datetime({ offset: true }).describe("Latest fulfillment date.").optional(), "totals": z.array(z.object({ "type": z.enum(["items_discount","subtotal","discount","fulfillment","tax","fee","total"]).describe("Type of total categorization."), "display_text": z.string().describe("Text to display against the amount. Should reflect appropriate method (e.g., 'Shipping', 'Delivery').").optional(), "amount": z.number().int().gte(0).describe("If type == total, sums subtotal - discount + fulfillment + tax + fee. Should be >= 0. Amount in minor (cents) currency units.") })).describe("Fulfillment option totals breakdown.") }).catchall(z.any()).describe("A fulfillment option within a group (e.g., Standard Shipping $5, Express $15).")
export type FulfillmentOptionRespSchema = z.infer<typeof FulfillmentOptionRespSchema>

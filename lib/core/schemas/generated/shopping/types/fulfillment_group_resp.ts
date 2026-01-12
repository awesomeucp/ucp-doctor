/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/fulfillment_group_resp.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/fulfillment_group.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.527Z
 */


import { z } from "zod"

/**
 * Fulfillment Group Response
 * 
 * A merchant-generated package/group of line items with fulfillment options.
 */
export const FulfillmentGroupRespSchema = z.object({ "id": z.string().describe("Group identifier for referencing merchant-generated groups in updates."), "line_item_ids": z.array(z.string()).describe("Line item IDs included in this group/package."), "options": z.array(z.object({ "id": z.string().describe("Unique fulfillment option identifier."), "title": z.string().describe("Short label (e.g., 'Express Shipping', 'Curbside Pickup')."), "description": z.string().describe("Complete context for buyer decision (e.g., 'Arrives Dec 12-15 via FedEx').").optional(), "carrier": z.string().describe("Carrier name (for shipping).").optional(), "earliest_fulfillment_time": z.string().datetime({ offset: true }).describe("Earliest fulfillment date.").optional(), "latest_fulfillment_time": z.string().datetime({ offset: true }).describe("Latest fulfillment date.").optional(), "totals": z.array(z.object({ "type": z.enum(["items_discount","subtotal","discount","fulfillment","tax","fee","total"]).describe("Type of total categorization."), "display_text": z.string().describe("Text to display against the amount. Should reflect appropriate method (e.g., 'Shipping', 'Delivery').").optional(), "amount": z.number().int().gte(0).describe("If type == total, sums subtotal - discount + fulfillment + tax + fee. Should be >= 0. Amount in minor (cents) currency units.") })).describe("Fulfillment option totals breakdown.") }).catchall(z.any()).describe("A fulfillment option within a group (e.g., Standard Shipping $5, Express $15).")).describe("Available fulfillment options for this group.").optional(), "selected_option_id": z.union([z.string().describe("ID of the selected fulfillment option for this group."), z.null().describe("ID of the selected fulfillment option for this group.")]).describe("ID of the selected fulfillment option for this group.").optional() }).catchall(z.any()).describe("A merchant-generated package/group of line items with fulfillment options.")
export type FulfillmentGroupRespSchema = z.infer<typeof FulfillmentGroupRespSchema>

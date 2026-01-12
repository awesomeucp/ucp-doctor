/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/line_item_resp.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/line_item.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.536Z
 */


import { z } from "zod"

/**
 * Line Item Response
 * 
 * Line item object. Expected to use the currency of the parent object.
 */
export const LineItemRespSchema = z.object({ "id": z.string(), "item": z.object({ "id": z.string().describe("Should be recognized by both the Platform, and the Business. For Google it should match the id provided in the \"id\" field in the product feed."), "title": z.string().describe("Product title."), "price": z.number().int().gte(0).describe("Unit price in minor (cents) currency units."), "image_url": z.string().url().describe("Product image URI.").optional() }), "quantity": z.number().int().gte(1).describe("Quantity of the item being purchased."), "totals": z.array(z.object({ "type": z.enum(["items_discount","subtotal","discount","fulfillment","tax","fee","total"]).describe("Type of total categorization."), "display_text": z.string().describe("Text to display against the amount. Should reflect appropriate method (e.g., 'Shipping', 'Delivery').").optional(), "amount": z.number().int().gte(0).describe("If type == total, sums subtotal - discount + fulfillment + tax + fee. Should be >= 0. Amount in minor (cents) currency units.") })).describe("Line item totals breakdown."), "parent_id": z.string().describe("Parent line item identifier for any nested structures.").optional() }).describe("Line item object. Expected to use the currency of the parent object.")
export type LineItemRespSchema = z.infer<typeof LineItemRespSchema>

/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/order_line_item.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/order_line_item.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.538Z
 */


import { z } from "zod"

/**
 * Order Line Item
 */
export const OrderLineItemSchema = z.object({ "id": z.string().describe("Line item identifier."), "item": z.object({ "id": z.string().describe("Should be recognized by both the Platform, and the Business. For Google it should match the id provided in the \"id\" field in the product feed."), "title": z.string().describe("Product title."), "price": z.number().int().gte(0).describe("Unit price in minor (cents) currency units."), "image_url": z.string().url().describe("Product image URI.").optional() }).describe("Product data (id, title, price, image_url)."), "quantity": z.object({ "total": z.number().int().gte(0).describe("Current total quantity."), "fulfilled": z.number().int().gte(0).describe("Quantity fulfilled (sum from fulfillment events).") }).describe("Quantity tracking. Both total and fulfilled are derived from events."), "totals": z.array(z.object({ "type": z.enum(["items_discount","subtotal","discount","fulfillment","tax","fee","total"]).describe("Type of total categorization."), "display_text": z.string().describe("Text to display against the amount. Should reflect appropriate method (e.g., 'Shipping', 'Delivery').").optional(), "amount": z.number().int().gte(0).describe("If type == total, sums subtotal - discount + fulfillment + tax + fee. Should be >= 0. Amount in minor (cents) currency units.") })).describe("Line item totals breakdown."), "status": z.enum(["processing","partial","fulfilled"]).describe("Derived status: fulfilled if quantity.fulfilled == quantity.total, partial if quantity.fulfilled > 0, otherwise processing."), "parent_id": z.string().describe("Parent line item identifier for any nested structures.").optional() })
export type OrderLineItemSchema = z.infer<typeof OrderLineItemSchema>

/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/adjustment.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/adjustment.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.520Z
 */


import { z } from "zod"

/**
 * Adjustment
 * 
 * Append-only event that exists independently of fulfillment. Typically represents money movements but can be any post-order change. Polymorphic type that can optionally reference line items.
 */
export const AdjustmentSchema = z.object({ "id": z.string().describe("Adjustment event identifier."), "type": z.string().describe("Type of adjustment (open string). Typically money-related like: refund, return, credit, price_adjustment, dispute, cancellation. Can be any value that makes sense for the merchant's business."), "occurred_at": z.string().datetime({ offset: true }).describe("RFC 3339 timestamp when this adjustment occurred."), "status": z.enum(["pending","completed","failed"]).describe("Adjustment status."), "line_items": z.array(z.object({ "id": z.string().describe("Line item ID reference."), "quantity": z.number().int().gte(1).describe("Quantity affected by this adjustment.") })).describe("Which line items and quantities are affected (optional).").optional(), "amount": z.number().int().describe("Amount in minor units (cents) for refunds, credits, price adjustments (optional).").optional(), "description": z.string().describe("Human-readable reason or description (e.g., 'Defective item', 'Customer requested').").optional() }).describe("Append-only event that exists independently of fulfillment. Typically represents money movements but can be any post-order change. Polymorphic type that can optionally reference line items.")
export type AdjustmentSchema = z.infer<typeof AdjustmentSchema>

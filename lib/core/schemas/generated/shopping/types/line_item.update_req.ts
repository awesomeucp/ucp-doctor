/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/line_item.update_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/line_item.update_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.535Z
 */


import { z } from "zod"

/**
 * Line Item Update Request
 * 
 * Line item object. Expected to use the currency of the parent object.
 */
export const LineItemUpdateReqSchema = z.object({ "id": z.string().optional(), "item": z.object({ "id": z.string().describe("Should be recognized by both the Platform, and the Business. For Google it should match the id provided in the \"id\" field in the product feed.") }), "quantity": z.number().int().gte(1).describe("Quantity of the item being purchased."), "parent_id": z.string().describe("Parent line item identifier for any nested structures.").optional() }).describe("Line item object. Expected to use the currency of the parent object.")
export type LineItemUpdateReqSchema = z.infer<typeof LineItemUpdateReqSchema>

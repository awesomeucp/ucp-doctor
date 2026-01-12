/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/line_item.create_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/line_item.create_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.534Z
 */


import { z } from "zod"

/**
 * Line Item Create Request
 * 
 * Line item object. Expected to use the currency of the parent object.
 */
export const LineItemCreateReqSchema = z.object({ "item": z.object({ "id": z.string().describe("Should be recognized by both the Platform, and the Business. For Google it should match the id provided in the \"id\" field in the product feed.") }), "quantity": z.number().int().gte(1).describe("Quantity of the item being purchased.") }).describe("Line item object. Expected to use the currency of the parent object.")
export type LineItemCreateReqSchema = z.infer<typeof LineItemCreateReqSchema>

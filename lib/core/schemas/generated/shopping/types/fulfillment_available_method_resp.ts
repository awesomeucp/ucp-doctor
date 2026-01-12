/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/fulfillment_available_method_resp.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/fulfillment_available_method.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.523Z
 */


import { z } from "zod"

/**
 * Fulfillment Available Method Response
 * 
 * Inventory availability hint for a fulfillment method type.
 */
export const FulfillmentAvailableMethodRespSchema = z.object({ "type": z.enum(["shipping","pickup"]).describe("Fulfillment method type this availability applies to."), "line_item_ids": z.array(z.string()).describe("Line items available for this fulfillment method."), "fulfillable_on": z.union([z.string().describe("'now' for immediate availability, or ISO 8601 date for future (preorders, transfers)."), z.null().describe("'now' for immediate availability, or ISO 8601 date for future (preorders, transfers).")]).describe("'now' for immediate availability, or ISO 8601 date for future (preorders, transfers).").optional(), "description": z.string().describe("Human-readable availability info (e.g., 'Available for pickup at Downtown Store today').").optional() }).catchall(z.any()).describe("Inventory availability hint for a fulfillment method type.")
export type FulfillmentAvailableMethodRespSchema = z.infer<typeof FulfillmentAvailableMethodRespSchema>

/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/fulfillment_available_method_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/fulfillment_available_method_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.523Z
 */


import { z } from "zod"

/**
 * Fulfillment Available Method Request
 * 
 * Inventory availability hint for a fulfillment method type.
 */
export const FulfillmentAvailableMethodReqSchema = z.object({}).catchall(z.any()).describe("Inventory availability hint for a fulfillment method type.")
export type FulfillmentAvailableMethodReqSchema = z.infer<typeof FulfillmentAvailableMethodReqSchema>

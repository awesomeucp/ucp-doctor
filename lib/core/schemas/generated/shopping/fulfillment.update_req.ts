/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/fulfillment.update_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/fulfillment.update_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.509Z
 */


import { z } from "zod"

/**
 * Fulfillment Extension Update Request
 * 
 * Extends Checkout with fulfillment support using methods, destinations, and groups.
 */
export const FulfillmentUpdateReqSchema = z.any().describe("Extends Checkout with fulfillment support using methods, destinations, and groups.")
export type FulfillmentUpdateReqSchema = z.infer<typeof FulfillmentUpdateReqSchema>

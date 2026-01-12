/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/fulfillment.create_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/fulfillment.create_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.505Z
 */


import { z } from "zod"

/**
 * Fulfillment Extension Create Request
 * 
 * Extends Checkout with fulfillment support using methods, destinations, and groups.
 */
export const FulfillmentCreateReqSchema = z.any().describe("Extends Checkout with fulfillment support using methods, destinations, and groups.")
export type FulfillmentCreateReqSchema = z.infer<typeof FulfillmentCreateReqSchema>

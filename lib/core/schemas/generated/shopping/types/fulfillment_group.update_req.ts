/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/fulfillment_group.update_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/fulfillment_group.update_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.526Z
 */


import { z } from "zod"

/**
 * Fulfillment Group Update Request
 * 
 * A merchant-generated package/group of line items with fulfillment options.
 */
export const FulfillmentGroupUpdateReqSchema = z.object({ "id": z.string().describe("Group identifier for referencing merchant-generated groups in updates."), "selected_option_id": z.union([z.string().describe("ID of the selected fulfillment option for this group."), z.null().describe("ID of the selected fulfillment option for this group.")]).describe("ID of the selected fulfillment option for this group.").optional() }).catchall(z.any()).describe("A merchant-generated package/group of line items with fulfillment options.")
export type FulfillmentGroupUpdateReqSchema = z.infer<typeof FulfillmentGroupUpdateReqSchema>

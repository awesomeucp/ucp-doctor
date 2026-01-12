/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/order_confirmation.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/order_confirmation.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.538Z
 */


import { z } from "zod"

/**
 * Order Confirmation
 * 
 * Order details available at the time of checkout completion.
 */
export const OrderConfirmationSchema = z.object({ "id": z.string().describe("Unique order identifier."), "permalink_url": z.string().url().describe("Permalink to access the order on merchant site.") }).describe("Order details available at the time of checkout completion.")
export type OrderConfirmationSchema = z.infer<typeof OrderConfirmationSchema>

/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/discount.create_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/discount.create_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.491Z
 */


import { z } from "zod"

/**
 * Discount Extension Create Request
 * 
 * Extends Checkout with discount code support, enabling agents to apply promotional, loyalty, referral, and other discount codes.
 */
export const DiscountCreateReqSchema = z.any().describe("Extends Checkout with discount code support, enabling agents to apply promotional, loyalty, referral, and other discount codes.")
export type DiscountCreateReqSchema = z.infer<typeof DiscountCreateReqSchema>

/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/buyer.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/buyer.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.521Z
 */


import { z } from "zod"

/**
 * Buyer
 */
export const BuyerSchema = z.object({ "first_name": z.string().describe("First name of the buyer.").optional(), "last_name": z.string().describe("Last name of the buyer.").optional(), "full_name": z.string().describe("Optional, buyer's full name (if first_name or last_name fields are present they take precedence).").optional(), "email": z.string().describe("Email of the buyer.").optional(), "phone_number": z.string().describe("E.164 standard.").optional() }).catchall(z.any())
export type BuyerSchema = z.infer<typeof BuyerSchema>

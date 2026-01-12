/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/account_info.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/account_info.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.520Z
 */


import { z } from "zod"

/**
 * Payment Account Info
 * 
 * Non-sensitive backend identifiers for linking.
 */
export const AccountInfoSchema = z.object({ "payment_account_reference": z.string().describe("EMVCo PAR. A unique identifier linking a payment card to a specific account, enabling tracking across tokens (Apple Pay, physical card, etc).").optional() }).describe("Non-sensitive backend identifiers for linking.")
export type AccountInfoSchema = z.infer<typeof AccountInfoSchema>

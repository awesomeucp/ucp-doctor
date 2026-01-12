/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/merchant_fulfillment_config.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/merchant_fulfillment_config.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.536Z
 */


import { z } from "zod"

/**
 * Merchant Fulfillment Config
 * 
 * Merchant's fulfillment configuration.
 */
export const MerchantFulfillmentConfigSchema = z.object({ "allows_multi_destination": z.object({ "shipping": z.boolean().describe("Multiple shipping destinations allowed.").optional(), "pickup": z.boolean().describe("Multiple pickup locations allowed.").optional() }).strict().describe("Permits multiple destinations per method type.").optional(), "allows_method_combinations": z.array(z.array(z.enum(["shipping","pickup"]))).describe("Allowed method type combinations.").optional() }).describe("Merchant's fulfillment configuration.")
export type MerchantFulfillmentConfigSchema = z.infer<typeof MerchantFulfillmentConfigSchema>

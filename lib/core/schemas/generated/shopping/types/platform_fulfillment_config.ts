/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/platform_fulfillment_config.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/platform_fulfillment_config.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.541Z
 */


import { z } from "zod"

/**
 * Platform Fulfillment Config
 * 
 * Platform's fulfillment configuration.
 */
export const PlatformFulfillmentConfigSchema = z.object({ "supports_multi_group": z.boolean().describe("Enables multiple groups per method.").default(false) }).describe("Platform's fulfillment configuration.")
export type PlatformFulfillmentConfigSchema = z.infer<typeof PlatformFulfillmentConfigSchema>

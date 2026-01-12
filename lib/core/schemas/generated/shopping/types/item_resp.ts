/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/item_resp.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/item.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.534Z
 */


import { z } from "zod"

/**
 * Item Response
 */
export const ItemRespSchema = z.object({ "id": z.string().describe("Should be recognized by both the Platform, and the Business. For Google it should match the id provided in the \"id\" field in the product feed."), "title": z.string().describe("Product title."), "price": z.number().int().gte(0).describe("Unit price in minor (cents) currency units."), "image_url": z.string().url().describe("Product image URI.").optional() })
export type ItemRespSchema = z.infer<typeof ItemRespSchema>

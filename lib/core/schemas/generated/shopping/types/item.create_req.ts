/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/item.create_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/item.create_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.533Z
 */


import { z } from "zod"

/**
 * Item Create Request
 */
export const ItemCreateReqSchema = z.object({ "id": z.string().describe("Should be recognized by both the Platform, and the Business. For Google it should match the id provided in the \"id\" field in the product feed.") })
export type ItemCreateReqSchema = z.infer<typeof ItemCreateReqSchema>

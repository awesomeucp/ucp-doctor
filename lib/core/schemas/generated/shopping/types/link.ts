/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/link.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/link.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.536Z
 */


import { z } from "zod"

/**
 * Link
 */
export const LinkSchema = z.object({ "type": z.string().describe("Type of link. Well-known values: `privacy_policy`, `terms_of_service`, `refund_policy`, `shipping_policy`, `faq`. Consumers SHOULD handle unknown values gracefully by displaying them using the `title` field or omitting the link."), "url": z.string().url().describe("The actual URL pointing to the content to be displayed."), "title": z.string().describe("Optional display text for the link. When provided, use this instead of generating from type.").optional() })
export type LinkSchema = z.infer<typeof LinkSchema>

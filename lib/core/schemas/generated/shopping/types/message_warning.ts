/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/message_warning.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/message_warning.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.537Z
 */


import { z } from "zod"

/**
 * Message Warning
 */
export const MessageWarningSchema = z.object({ "type": z.literal("warning").describe("Message type discriminator."), "path": z.string().describe("JSONPath (RFC 9535) to related field (e.g., $.line_items[0]).").optional(), "code": z.string().describe("Warning code. Machine-readable identifier for the warning type (e.g., final_sale, prop65, fulfillment_changed, age_restricted, etc.)."), "content": z.string().describe("Human-readable warning message that MUST be displayed."), "content_type": z.enum(["plain","markdown"]).describe("Content format, default = plain.").default("plain") })
export type MessageWarningSchema = z.infer<typeof MessageWarningSchema>

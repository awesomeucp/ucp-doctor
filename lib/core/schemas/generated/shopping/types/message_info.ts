/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/message_info.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/message_info.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.537Z
 */


import { z } from "zod"

/**
 * Message Info
 */
export const MessageInfoSchema = z.object({ "type": z.literal("info").describe("Message type discriminator."), "path": z.string().describe("RFC 9535 JSONPath to the component the message refers to.").optional(), "code": z.string().describe("Info code for programmatic handling.").optional(), "content_type": z.enum(["plain","markdown"]).describe("Content format, default = plain.").default("plain"), "content": z.string().describe("Human-readable message.") })
export type MessageInfoSchema = z.infer<typeof MessageInfoSchema>

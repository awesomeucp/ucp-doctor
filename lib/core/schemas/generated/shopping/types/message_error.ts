/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/message_error.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/message_error.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.537Z
 */


import { z } from "zod"

/**
 * Message Error
 */
export const MessageErrorSchema = z.object({ "type": z.literal("error").describe("Message type discriminator."), "code": z.string().describe("Error code. Possible values include: missing, invalid, out_of_stock, payment_declined, requires_sign_in, requires_3ds, requires_identity_linking. Freeform codes also allowed."), "path": z.string().describe("RFC 9535 JSONPath to the component the message refers to (e.g., $.items[1]).").optional(), "content_type": z.enum(["plain","markdown"]).describe("Content format, default = plain.").default("plain"), "content": z.string().describe("Human-readable message."), "severity": z.enum(["recoverable","requires_buyer_input","requires_buyer_review"]).describe("Declares who resolves this error. 'recoverable': agent can fix via API. 'requires_buyer_input': merchant requires information their API doesn't support collecting programmatically (checkout incomplete). 'requires_buyer_review': buyer must authorize before order placement due to policy, regulatory, or entitlement rules (checkout complete). Errors with 'requires_*' severity contribute to 'status: requires_escalation'.") })
export type MessageErrorSchema = z.infer<typeof MessageErrorSchema>

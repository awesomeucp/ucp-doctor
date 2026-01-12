/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/message.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/message.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.537Z
 */


import { z } from "zod"

/**
 * Message
 * 
 * Container for error, warning, or info messages.
 */
export const MessageSchema = z.record(z.any()).and(z.any().superRefine((x, ctx) => {
    const schemas = [z.object({ "type": z.literal("error").describe("Message type discriminator."), "code": z.string().describe("Error code. Possible values include: missing, invalid, out_of_stock, payment_declined, requires_sign_in, requires_3ds, requires_identity_linking. Freeform codes also allowed."), "path": z.string().describe("RFC 9535 JSONPath to the component the message refers to (e.g., $.items[1]).").optional(), "content_type": z.enum(["plain","markdown"]).describe("Content format, default = plain.").default("plain"), "content": z.string().describe("Human-readable message."), "severity": z.enum(["recoverable","requires_buyer_input","requires_buyer_review"]).describe("Declares who resolves this error. 'recoverable': agent can fix via API. 'requires_buyer_input': merchant requires information their API doesn't support collecting programmatically (checkout incomplete). 'requires_buyer_review': buyer must authorize before order placement due to policy, regulatory, or entitlement rules (checkout complete). Errors with 'requires_*' severity contribute to 'status: requires_escalation'.") }), z.object({ "type": z.literal("warning").describe("Message type discriminator."), "path": z.string().describe("JSONPath (RFC 9535) to related field (e.g., $.line_items[0]).").optional(), "code": z.string().describe("Warning code. Machine-readable identifier for the warning type (e.g., final_sale, prop65, fulfillment_changed, age_restricted, etc.)."), "content": z.string().describe("Human-readable warning message that MUST be displayed."), "content_type": z.enum(["plain","markdown"]).describe("Content format, default = plain.").default("plain") }), z.object({ "type": z.literal("info").describe("Message type discriminator."), "path": z.string().describe("RFC 9535 JSONPath to the component the message refers to.").optional(), "code": z.string().describe("Info code for programmatic handling.").optional(), "content_type": z.enum(["plain","markdown"]).describe("Content format, default = plain.").default("plain"), "content": z.string().describe("Human-readable message.") })];
    const errors = schemas.reduce<z.ZodError[]>(
      (errors, schema) =>
        ((result) =>
          result.error ? [...errors, result.error] : errors)(
          schema.safeParse(x),
        ),
      [],
    );
    if (schemas.length - errors.length !== 1) {
      ctx.addIssue({
        path: ctx.path,
        code: "invalid_union",
        unionErrors: errors,
        message: "Invalid input: Should pass single schema",
      });
    }
  })).describe("Container for error, warning, or info messages.")
export type MessageSchema = z.infer<typeof MessageSchema>

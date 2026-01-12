/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/payment_handler_resp.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/payment_handler.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.540Z
 */


import { z } from "zod"

/**
 * Payment Handler Response
 */
export const PaymentHandlerRespSchema = z.object({ "id": z.string().describe("The unique identifier for this handler instance within the payment.handlers. Used by payment instruments to reference which handler produced them."), "name": z.string().describe("The specification name using reverse-DNS format. For example, dev.ucp.delegate_payment."), "version": z.string().regex(new RegExp("^\\d{4}-\\d{2}-\\d{2}$")).describe("Handler version in YYYY-MM-DD format."), "spec": z.string().url().describe("A URI pointing to the technical specification or schema that defines how this handler operates."), "config_schema": z.string().url().describe("A URI pointing to a JSON Schema used to validate the structure of the config object."), "instrument_schemas": z.array(z.string().url().describe("A URI pointing to a schema definition (e.g., JSON Schema) used to validate the structure of the instrument object.")), "config": z.record(z.any()).describe("A dictionary containing provider-specific configuration details, such as merchant IDs, supported networks, or gateway credentials.") })
export type PaymentHandlerRespSchema = z.infer<typeof PaymentHandlerRespSchema>

/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/token_credential.create_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/token_credential.create_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.544Z
 */


import { z } from "zod"

/**
 * Token Credential Create Request
 * 
 * Base token credential schema. Concrete payment handlers may extend this schema with additional fields and define their own constraints.
 */
export const TokenCredentialCreateReqSchema = z.object({ "type": z.string().describe("The specific type of token produced by the handler (e.g., 'stripe_token')."), "token": z.string().describe("The token value.") }).catchall(z.any()).describe("Base token credential schema. Concrete payment handlers may extend this schema with additional fields and define their own constraints.")
export type TokenCredentialCreateReqSchema = z.infer<typeof TokenCredentialCreateReqSchema>

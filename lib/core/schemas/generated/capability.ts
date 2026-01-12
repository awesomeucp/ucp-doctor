/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/capability.json
 * Schema ID: https://ucp.dev/schemas/capability.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.446Z
 */


import { z } from "zod"

/**
 * UCP Capability
 * 
 * Schema for UCP capabilities and extensions. Extensions are capabilities with an 'extends' field. Uses reverse-domain naming for governance.
 */
export const CapabilitySchema = z.any().describe("Schema for UCP capabilities and extensions. Extensions are capabilities with an 'extends' field. Uses reverse-domain naming for governance.")
export type CapabilitySchema = z.infer<typeof CapabilitySchema>

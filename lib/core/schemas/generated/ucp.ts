/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/ucp.json
 * Schema ID: https://ucp.dev/schemas/ucp.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.553Z
 */


import { z } from "zod"

/**
 * UCP Metadata
 * 
 * Protocol metadata for discovery profiles and responses. Uses slim schema pattern with context-specific required fields.
 */
export const UcpSchema = z.any().describe("Protocol metadata for discovery profiles and responses. Uses slim schema pattern with context-specific required fields.")
export type UcpSchema = z.infer<typeof UcpSchema>

/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/shipping_destination_req.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/shipping_destination_req.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.543Z
 */


import { z } from "zod"

/**
 * Shipping Destination Request
 * 
 * Shipping destination.
 */
export const ShippingDestinationReqSchema = z.record(z.any()).and(z.intersection(z.object({ "extended_address": z.string().describe("An address extension such as an apartment number, C/O or alternative name.").optional(), "street_address": z.string().describe("The street address.").optional(), "address_locality": z.string().describe("The locality in which the street address is, and which is in the region. For example, Mountain View.").optional(), "address_region": z.string().describe("The region in which the locality is, and which is in the country. Required for applicable countries (i.e. state in US, province in CA). For example, California or another appropriate first-level Administrative division.").optional(), "address_country": z.string().describe("The country. Recommended to be in 2-letter ISO 3166-1 alpha-2 format, for example \"US\". For backward compatibility, a 3-letter ISO 3166-1 alpha-3 country code such as \"SGP\" or a full country name such as \"Singapore\" can also be used.").optional(), "postal_code": z.string().describe("The postal code. For example, 94043.").optional(), "first_name": z.string().describe("Optional. First name of the contact associated with the address.").optional(), "last_name": z.string().describe("Optional. Last name of the contact associated with the address.").optional(), "full_name": z.string().describe("Optional. Full name of the contact associated with the address (if first_name or last_name fields are present they take precedence).").optional(), "phone_number": z.string().describe("Optional. Phone number of the contact associated with the address.").optional() }), z.object({ "id": z.string().describe("ID specific to this shipping destination.").optional() }))).describe("Shipping destination.")
export type ShippingDestinationReqSchema = z.infer<typeof ShippingDestinationReqSchema>

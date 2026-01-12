/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/fulfillment_method_resp.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/fulfillment_method.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.530Z
 */


import { z } from "zod"

/**
 * Fulfillment Method Response
 * 
 * A fulfillment method (shipping or pickup) with destinations and groups.
 */
export const FulfillmentMethodRespSchema = z.object({ "id": z.string().describe("Unique fulfillment method identifier."), "type": z.enum(["shipping","pickup"]).describe("Fulfillment method type."), "line_item_ids": z.array(z.string()).describe("Line item IDs fulfilled via this method."), "destinations": z.array(z.record(z.any()).and(z.any().superRefine((x, ctx) => {
    const schemas = [z.record(z.any()).and(z.intersection(z.object({ "extended_address": z.string().describe("An address extension such as an apartment number, C/O or alternative name.").optional(), "street_address": z.string().describe("The street address.").optional(), "address_locality": z.string().describe("The locality in which the street address is, and which is in the region. For example, Mountain View.").optional(), "address_region": z.string().describe("The region in which the locality is, and which is in the country. Required for applicable countries (i.e. state in US, province in CA). For example, California or another appropriate first-level Administrative division.").optional(), "address_country": z.string().describe("The country. Recommended to be in 2-letter ISO 3166-1 alpha-2 format, for example \"US\". For backward compatibility, a 3-letter ISO 3166-1 alpha-3 country code such as \"SGP\" or a full country name such as \"Singapore\" can also be used.").optional(), "postal_code": z.string().describe("The postal code. For example, 94043.").optional(), "first_name": z.string().describe("Optional. First name of the contact associated with the address.").optional(), "last_name": z.string().describe("Optional. Last name of the contact associated with the address.").optional(), "full_name": z.string().describe("Optional. Full name of the contact associated with the address (if first_name or last_name fields are present they take precedence).").optional(), "phone_number": z.string().describe("Optional. Phone number of the contact associated with the address.").optional() }), z.object({ "id": z.string().describe("ID specific to this shipping destination.") }))).describe("Shipping destination."), z.object({ "id": z.string().describe("Unique location identifier."), "name": z.string().describe("Location name (e.g., store name)."), "address": z.any().describe("Physical address of the location.").optional() }).catchall(z.any()).describe("A pickup location (retail store, locker, etc.).")];
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
  })).describe("A destination for fulfillment.")).describe("Available destinations. For shipping: addresses. For pickup: retail locations.").optional(), "selected_destination_id": z.union([z.string().describe("ID of the selected destination."), z.null().describe("ID of the selected destination.")]).describe("ID of the selected destination.").optional(), "groups": z.array(z.object({ "id": z.string().describe("Group identifier for referencing merchant-generated groups in updates."), "line_item_ids": z.array(z.string()).describe("Line item IDs included in this group/package."), "options": z.array(z.object({ "id": z.string().describe("Unique fulfillment option identifier."), "title": z.string().describe("Short label (e.g., 'Express Shipping', 'Curbside Pickup')."), "description": z.string().describe("Complete context for buyer decision (e.g., 'Arrives Dec 12-15 via FedEx').").optional(), "carrier": z.string().describe("Carrier name (for shipping).").optional(), "earliest_fulfillment_time": z.string().datetime({ offset: true }).describe("Earliest fulfillment date.").optional(), "latest_fulfillment_time": z.string().datetime({ offset: true }).describe("Latest fulfillment date.").optional(), "totals": z.array(z.object({ "type": z.enum(["items_discount","subtotal","discount","fulfillment","tax","fee","total"]).describe("Type of total categorization."), "display_text": z.string().describe("Text to display against the amount. Should reflect appropriate method (e.g., 'Shipping', 'Delivery').").optional(), "amount": z.number().int().gte(0).describe("If type == total, sums subtotal - discount + fulfillment + tax + fee. Should be >= 0. Amount in minor (cents) currency units.") })).describe("Fulfillment option totals breakdown.") }).catchall(z.any()).describe("A fulfillment option within a group (e.g., Standard Shipping $5, Express $15).")).describe("Available fulfillment options for this group.").optional(), "selected_option_id": z.union([z.string().describe("ID of the selected fulfillment option for this group."), z.null().describe("ID of the selected fulfillment option for this group.")]).describe("ID of the selected fulfillment option for this group.").optional() }).catchall(z.any()).describe("A merchant-generated package/group of line items with fulfillment options.")).describe("Fulfillment groups for selecting options. Agent sets selected_option_id on groups to choose shipping method.").optional() }).catchall(z.any()).describe("A fulfillment method (shipping or pickup) with destinations and groups.")
export type FulfillmentMethodRespSchema = z.infer<typeof FulfillmentMethodRespSchema>

/**
 * Auto-generated from UCP JSON Schema
 * Source: /Users/kilic/Dev/universal-commerce-protocol/ucp/spec/schemas/shopping/types/fulfillment_event.json
 * Schema ID: https://ucp.dev/schemas/shopping/types/fulfillment_event.json
 *
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * To update: Run `bun run schemas:generate` from ucp-doctor root
 *
 * Generated: 2026-01-16T11:38:45.526Z
 */


import { z } from "zod"

/**
 * Fulfillment Event
 * 
 * Append-only fulfillment event representing an actual shipment. References line items by ID.
 */
export const FulfillmentEventSchema = z.object({ "id": z.string().describe("Fulfillment event identifier."), "occurred_at": z.string().datetime({ offset: true }).describe("RFC 3339 timestamp when this fulfillment event occurred."), "type": z.string().describe("Fulfillment event type. Common values include: processing (preparing to ship), shipped (handed to carrier), in_transit (in delivery network), delivered (received by buyer), failed_attempt (delivery attempt failed), canceled (fulfillment canceled), undeliverable (cannot be delivered), returned_to_sender (returned to merchant)."), "line_items": z.array(z.object({ "id": z.string().describe("Line item ID reference."), "quantity": z.number().int().gte(1).describe("Quantity fulfilled in this event.") })).describe("Which line items and quantities are fulfilled in this event."), "tracking_number": z.string().describe("Carrier tracking number (required if type != processing).").optional(), "tracking_url": z.string().url().describe("URL to track this shipment (required if type != processing).").optional(), "carrier": z.string().describe("Carrier name (e.g., 'FedEx', 'USPS').").optional(), "description": z.string().describe("Human-readable description of the shipment status or delivery information (e.g., 'Delivered to front door', 'Out for delivery').").optional() }).describe("Append-only fulfillment event representing an actual shipment. References line items by ID.")
export type FulfillmentEventSchema = z.infer<typeof FulfillmentEventSchema>

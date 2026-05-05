package fr.hoenheimsports.backend.membershipservice.dtos;

/**
 * Request body for SumUp webhook notifications.
 *
 * @param event_type the type of event (e.g., checkout.status.changed)
 * @param data       the data associated with the event
 */
public record SumUpWebhookRequest(String event_type, SumUpWebhookData data) {
}

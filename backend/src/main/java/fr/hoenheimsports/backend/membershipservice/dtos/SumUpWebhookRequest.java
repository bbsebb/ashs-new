package fr.hoenheimsports.backend.membershipservice.dtos;

/**
 * Request body for SumUp webhook notifications.
 *
 * @param event_type the type of event (e.g., checkout.status.changed)
 * @param id       the id of the payment
 */
public record SumUpWebhookRequest(String event_type, String id) {
}

package fr.hoenheimsports.backend.membershipservice.events;

/**
 * Event published when a SumUp payment notification is received via webhook.
 *
 * @param checkoutId the ID of the checkout session
 * @param status     the status of the payment (e.g., PAID, FAILED)
 */
public record SumUpPaymentEvent(String checkoutId, String status) {
}

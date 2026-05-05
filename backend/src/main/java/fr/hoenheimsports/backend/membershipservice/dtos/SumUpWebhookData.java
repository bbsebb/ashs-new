package fr.hoenheimsports.backend.membershipservice.dtos;

/**
 * Data contained in a SumUp webhook notification.
 *
 * @param id     the ID of the resource (checkout ID)
 * @param status the status of the resource
 */
public record SumUpWebhookData(String id, String status) {
}

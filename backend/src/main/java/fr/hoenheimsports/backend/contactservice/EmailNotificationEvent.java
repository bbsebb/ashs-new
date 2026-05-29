package fr.hoenheimsports.backend.contactservice;

/**
 * Event published to trigger sending a personalized email.
 *
 * @param recipient the destination email address
 * @param subject   the email subject line
 * @param body      the body content of the email
 */
public record EmailNotificationEvent(String recipient, String subject, String body) {
}

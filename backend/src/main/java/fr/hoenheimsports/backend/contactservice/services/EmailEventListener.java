package fr.hoenheimsports.backend.contactservice.services;

import fr.hoenheimsports.backend.contactservice.EmailNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

/**
 * Event listener that processes {@link EmailNotificationEvent}s and delegates them to the {@link ContactService}.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailEventListener {
    /**
     * Service used to send emails.
     */
    private final ContactService contactService;

    /**
     * Listens to the {@link EmailNotificationEvent} and sends a personalized email.
     *
     * @param event the email notification event containing recipient, subject, and body
     */
    @ApplicationModuleListener
    public void onEmailNotification(EmailNotificationEvent event) {
        log.debug("Processing EmailNotificationEvent: {}", event);
        log.info("Received EmailNotificationEvent for recipient: {}", event.recipient());
        this.contactService.sendEmail(event.recipient(), event.subject(), event.body());
    }
}

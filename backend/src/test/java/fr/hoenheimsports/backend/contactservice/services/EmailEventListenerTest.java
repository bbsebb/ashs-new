package fr.hoenheimsports.backend.contactservice.services;

import fr.hoenheimsports.backend.contactservice.EmailNotificationEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailEventListener Unit Tests")
class EmailEventListenerTest {

    @Mock
    private ContactService contactService;

    @InjectMocks
    private EmailEventListener emailEventListener;

    @Test
    @DisplayName("Should delegate email sending to ContactService when event is received")
    void shouldDelegateToContactServiceOnEvent() {
        // Given
        EmailNotificationEvent event = new EmailNotificationEvent(
                "recipient@example.com",
                "Test Event",
                "Event body content"
        );

        // When
        emailEventListener.onEmailNotification(event);

        // Then
        verify(contactService).sendEmail("recipient@example.com", "Test Event", "Event body content");
    }
}

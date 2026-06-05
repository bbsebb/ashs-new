package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.contactservice.EmailNotificationEvent;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MembershipEmailService Unit Tests")
class MembershipEmailServiceTest {

    @Mock
    private ApplicationEventPublisher applicationEventPublisher;

    @InjectMocks
    private MembershipEmailService emailService;

    @Test
    @DisplayName("Should publish email event when payment is initiated")
    void shouldPublishEventOnPaymentInitiated() {
        // Given
        PaymentPayerInfo payerInfo = new PaymentPayerInfo("John", "Doe", "john.doe@example.com");

        // When
        emailService.sendPaymentInitiatedEmail(payerInfo);

        // Then
        ArgumentCaptor<EmailNotificationEvent> eventCaptor = ArgumentCaptor.forClass(EmailNotificationEvent.class);
        verify(applicationEventPublisher).publishEvent(eventCaptor.capture());
        EmailNotificationEvent event = eventCaptor.getValue();
        assertThat(event.recipient()).isEqualTo("john.doe@example.com");
        assertThat(event.subject()).isEqualTo("Demande d'adhésion prise en compte - AS Hoenheim Sports");
        assertThat(event.body()).contains("Votre demande d'adhésion a bien été prise en compte");
    }

    @Test
    @DisplayName("Should publish confirmation email event when payment status transitions to PAID")
    void shouldPublishConfirmationEventOnPaid() {
        // Given
        PaymentPayerInfo payerInfo = new PaymentPayerInfo("John", "Doe", "john.doe@example.com");

        // When
        emailService.sendPaymentStatusTransitionEmail(payerInfo, MembershipStatus.PAID);

        // Then
        ArgumentCaptor<EmailNotificationEvent> eventCaptor = ArgumentCaptor.forClass(EmailNotificationEvent.class);
        verify(applicationEventPublisher).publishEvent(eventCaptor.capture());
        EmailNotificationEvent event = eventCaptor.getValue();
        assertThat(event.recipient()).isEqualTo("john.doe@example.com");
        assertThat(event.subject()).isEqualTo("Confirmation de votre paiement - AS Hoenheim Sports");
        assertThat(event.body()).contains("validation de votre licence sera traitée ultérieurement");
    }

    @Test
    @DisplayName("Should publish failure email event when payment status transitions to FAILED")
    void shouldPublishFailureEventOnFailed() {
        // Given
        PaymentPayerInfo payerInfo = new PaymentPayerInfo("John", "Doe", "john.doe@example.com");

        // When
        emailService.sendPaymentStatusTransitionEmail(payerInfo, MembershipStatus.FAILED);

        // Then
        ArgumentCaptor<EmailNotificationEvent> eventCaptor = ArgumentCaptor.forClass(EmailNotificationEvent.class);
        verify(applicationEventPublisher).publishEvent(eventCaptor.capture());
        EmailNotificationEvent event = eventCaptor.getValue();
        assertThat(event.recipient()).isEqualTo("john.doe@example.com");
        assertThat(event.subject()).isEqualTo("Échec de votre paiement - AS Hoenheim Sports");
        assertThat(event.body()).contains("tentative de paiement");
    }

    @Test
    @DisplayName("Should publish expired email event when payment status transitions to EXPIRED")
    void shouldPublishExpiredEventOnExpired() {
        // Given
        PaymentPayerInfo payerInfo = new PaymentPayerInfo("John", "Doe", "john.doe@example.com");

        // When
        emailService.sendPaymentStatusTransitionEmail(payerInfo, MembershipStatus.EXPIRED);

        // Then
        ArgumentCaptor<EmailNotificationEvent> eventCaptor = ArgumentCaptor.forClass(EmailNotificationEvent.class);
        verify(applicationEventPublisher).publishEvent(eventCaptor.capture());
        EmailNotificationEvent event = eventCaptor.getValue();
        assertThat(event.recipient()).isEqualTo("john.doe@example.com");
        assertThat(event.subject()).isEqualTo("Demande d'adhésion expirée - AS Hoenheim Sports");
        assertThat(event.body()).contains("Le délai de paiement");
    }

    @Test
    @DisplayName("Should not publish email event when status transitions to PENDING")
    void shouldNotPublishEventOnPending() {
        // Given
        PaymentPayerInfo payerInfo = new PaymentPayerInfo("John", "Doe", "john.doe@example.com");

        // When
        emailService.sendPaymentStatusTransitionEmail(payerInfo, MembershipStatus.PENDING);

        // Then
        verify(applicationEventPublisher, never()).publishEvent(any(EmailNotificationEvent.class));
    }

    @Test
    @DisplayName("Should publish validation email event when licence is processed")
    void shouldPublishValidationEventOnLicenceProcessed() {
        // Given
        Membership membership = new Membership();
        membership.setFirstName("Jane");
        membership.setLastName("Doe");
        membership.setEmail(new Email("jane.doe@example.com"));
        membership.setCategory(new Category("U11", Price.of("100.00")));

        // When
        emailService.sendLicenceValidatedEmail(membership);

        // Then
        ArgumentCaptor<EmailNotificationEvent> eventCaptor = ArgumentCaptor.forClass(EmailNotificationEvent.class);
        verify(applicationEventPublisher).publishEvent(eventCaptor.capture());
        EmailNotificationEvent event = eventCaptor.getValue();
        assertThat(event.recipient()).isEqualTo("jane.doe@example.com");
        assertThat(event.subject()).isEqualTo("Validation de votre licence - AS Hoenheim Sports");
        assertThat(event.body()).contains("Jane Doe");
        assertThat(event.body()).contains("U11");
    }
}

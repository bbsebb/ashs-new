package fr.hoenheimsports.backend.contactservice.services;

import fr.hoenheimsports.backend.contactservice.exceptions.MailServiceException;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ContactService Unit Tests")
class ContactServiceTest {

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private ContactService contactService;

    @Test
    @DisplayName("Should send HTML email successfully with template wrapper")
    void shouldSendEmailSuccessfully() throws Exception {
        // Given
        String recipient = "member@example.com";
        String subject = "Adhésion traitée";
        String body = "Votre adhésion a été validée avec succès.";

        java.util.Properties properties = new java.util.Properties();
        Session session = Session.getInstance(properties);
        MimeMessage mimeMessage = new MimeMessage(session);
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        // When
        contactService.sendEmail(recipient, subject, body);

        // Then
        ArgumentCaptor<MimeMessage> messageCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(javaMailSender).send(messageCaptor.capture());

        MimeMessage capturedMessage = messageCaptor.getValue();
        assertThat(capturedMessage.getRecipients(Message.RecipientType.TO)[0].toString()).isEqualTo(recipient);
        assertThat(capturedMessage.getSubject()).isEqualTo(subject);

        String content = (String) capturedMessage.getContent();
        assertThat(content).contains("AS Hoenheim Sports");
        assertThat(content).contains("Votre adhésion a été validée avec succès.");
    }

    @Test
    @DisplayName("Should throw MailServiceException when JavaMailSender fails")
    void shouldThrowMailServiceExceptionWhenJavaMailSenderFails() {
        // Given
        String recipient = "member@example.com";
        String subject = "Adhésion traitée";
        String body = "Votre adhésion a été validée avec succès.";

        java.util.Properties properties = new java.util.Properties();
        Session session = Session.getInstance(properties);
        MimeMessage mimeMessage = new MimeMessage(session);
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        doThrow(new RuntimeException("SMTP Server connection failed"))
                .when(javaMailSender).send(any(MimeMessage.class));

        // When & Then
        assertThatThrownBy(() -> contactService.sendEmail(recipient, subject, body))
                .isInstanceOf(MailServiceException.class)
                .satisfies(exception -> {
                    MailServiceException mailException = (MailServiceException) exception;
                    assertThat(mailException.getBody().getDetail()).isEqualTo("Erreur lors de l'envoi de l'email");
                    assertThat(mailException.getBody().getTitle()).isEqualTo("L'email n'a pas pu être envoyé");
                });
    }
}

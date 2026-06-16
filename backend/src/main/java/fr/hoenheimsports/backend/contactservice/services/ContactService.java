package fr.hoenheimsports.backend.contactservice.services;

import fr.hoenheimsports.backend.contactservice.exceptions.MailServiceException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Service responsible for managing contact emails.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ContactService {
    /**
     * Mail sender interface used for sending emails.
     */
    private final JavaMailSender javaMailSender;

    /**
     * The administrator email address configured in application properties.
     */
    @Value("${contact.administrator.email.address}")
    private String ADMINISTRATOR_EMAIL_ADDRESS;

    /**
     * HTML template for personalized emails.
     */
    private static final String EMAIL_TEMPLATE = """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AS Hoenheim Sports</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 20px 0;">
                    <tr>
                        <td align="center">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                                <!-- Header -->
                                <tr>
                                    <td style="background-color: #0284c7; padding: 24px; text-align: center;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">AS Hoenheim Sports</h1>
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 32px 24px; line-height: 1.6; font-size: 16px; color: #334155; white-space: pre-wrap;">{{body}}</td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 8px 0;">© 2026 AS Hoenheim Sports. Tous droits réservés.</p>
                                        <p style="margin: 0;">Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """;




    /**
     * Formats and sends a contact email to the administrator.
     *
     * @param senderEmailAddress    the email address of the person initiating the contact
     * @param contactMessageSubject the subject line for the email
     * @param contactMessageContent the main body content of the message
     * @throws MailServiceException if the email fails to be sent
     */
    public void sendContactEmail(String senderEmailAddress, String contactMessageSubject, String contactMessageContent) {
        log.debug("Entering sendContactEmail with senderEmailAddress: {}, subject: {}", senderEmailAddress, contactMessageSubject);
        try {
            SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
            simpleMailMessage.setFrom(senderEmailAddress);
            simpleMailMessage.setReplyTo(senderEmailAddress);
            simpleMailMessage.setTo(ADMINISTRATOR_EMAIL_ADDRESS);
            simpleMailMessage.setSubject("Email reçu depuis contact : " + contactMessageSubject);

            String formattedEmailContent = "Expéditeur : " + senderEmailAddress + "\n" +
                    "Sujet : " + contactMessageSubject + "\n\n" +
                    "Message :\n" + contactMessageContent;
            simpleMailMessage.setText(formattedEmailContent);

            this.javaMailSender.send(simpleMailMessage);
            log.info("Email envoyé avec succès !");
        } catch (Exception exception) {
            log.error("Error while sending email from {}: {}", senderEmailAddress, exception.getMessage());
            throw new MailServiceException("Erreur lors de l'envoi de l'email");
        }
    }

    /**
     * Sends a personalized email to a specific recipient.
     *
     * @param recipient      the email address of the receiver
     * @param subject        the subject line of the email
     * @param body           the main body content of the message
     * @throws MailServiceException if the email fails to be sent
     */
    public void sendEmail(String recipient, String subject, String body) {
        log.debug("Entering sendEmail with recipient: {}, subject: {}", recipient, subject);
        try {
            MimeMessage mimeMessage = this.javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            
            helper.setTo(recipient);
            helper.setSubject(subject);
            
            String htmlContent = EMAIL_TEMPLATE.replace("{{body}}", body);
            helper.setText(htmlContent, true);

            this.javaMailSender.send(mimeMessage);
            log.info("Email sent successfully to {}!", recipient);
        } catch (Exception exception) {
            log.error("Error while sending email to {}: {}", recipient, exception.getMessage());
            throw new MailServiceException("Erreur lors de l'envoi de l'email");
        }
    }
}

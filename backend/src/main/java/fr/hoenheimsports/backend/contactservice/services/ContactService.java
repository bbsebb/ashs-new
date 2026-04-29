package fr.hoenheimsports.backend.contactservice.services;

import fr.hoenheimsports.backend.contactservice.exceptions.MailServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service responsible for managing contact emails.
 */
@Service
@Slf4j
public class ContactService {
    private final JavaMailSender javaMailSender;
    @Value("${contact.administrator.email.address}")
    private String ADMINISTRATOR_EMAIL_ADDRESS;


    /**
     * Constructs a new ContactService with the required JavaMailSender.
     *
     * @param javaMailSender the Spring mail sender used to dispatch emails
     */
    public ContactService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    /**
     * Formats and sends a contact email to the administrator.
     *
     * @param senderEmailAddress    the email address of the person initiating the contact
     * @param contactMessageSubject the subject line for the email
     * @param contactMessageContent the main body content of the message
     * @throws MailServiceException if the email fails to be sent
     */
    public void sendContactEmail(String senderEmailAddress, String contactMessageSubject, String contactMessageContent) {
        try {
            SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
            simpleMailMessage.setFrom(senderEmailAddress);
            simpleMailMessage.setTo(ADMINISTRATOR_EMAIL_ADDRESS);
            simpleMailMessage.setSubject("Email reçu depuis contact : " + contactMessageSubject);

            String formattedEmailContent = "Expéditeur : " + senderEmailAddress + "\n" +
                    "Sujet : " + contactMessageSubject + "\n\n" +
                    "Message :\n" + contactMessageContent;
            simpleMailMessage.setText(formattedEmailContent);

            this.javaMailSender.send(simpleMailMessage);
            log.info("Email envoyé avec succès !");
        } catch (Exception exception) {
            log.error("Error while sending email: {}", exception.getMessage());
            throw new MailServiceException("Erreur lors de l'envoi de l'email");
        }
    }
}

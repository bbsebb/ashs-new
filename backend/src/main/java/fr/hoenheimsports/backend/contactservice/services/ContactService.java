package fr.hoenheimsports.backend.contactservice.services;

import fr.hoenheimsports.backend.contactservice.exceptions.MailServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ContactService {
    private final JavaMailSender javaMailSender;
    private final static String ADMINISTRATOR_EMAIL_ADDRESS ="sebastien.burckhardt@hoenheimsports.fr";


    // Constructor injection (recommended in 2026)
    public ContactService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

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

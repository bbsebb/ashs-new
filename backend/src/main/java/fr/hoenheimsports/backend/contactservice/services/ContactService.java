package fr.hoenheimsports.backend.contactservice.services;

import fr.hoenheimsports.backend.contactservice.exceptions.MailServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ContactService {
    private final JavaMailSender mailSender;
    private final static String to ="sebastien.burckhardt@hoenheimsports.fr";


    // Injection par constructeur (recommandé en 2026)
    public ContactService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendmail(String from, String subject, String content) {
        try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);

        mailSender.send(message);
        log.info("Email envoyé avec succès !");}
        catch (Exception e) {
            throw new MailServiceException("Erreur lors de l'envoi de l'email");
        }
    }
}

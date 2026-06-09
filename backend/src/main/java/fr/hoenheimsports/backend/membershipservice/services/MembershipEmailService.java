package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.contactservice.EmailNotificationEvent;
import fr.hoenheimsports.backend.membershipservice.entities.Membership;
import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.entities.PaymentPayerInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

/**
 * Service responsible for constructing and sending notification emails related to memberships and payments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipEmailService {

    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * Sends an email notification when a membership payment is initiated.
     *
     * @param payerInfo the payment payer details
     */
    public void sendPaymentInitiatedEmail(PaymentPayerInfo payerInfo) {
        String recipientEmailAddress = payerInfo.email();
        log.info("Request to send payment initiated email to recipient: {}", recipientEmailAddress);
        String emailSubject = "Demande d'adhésion prise en compte - AS Hoenheim Sports";
        String emailBodyContent = """
                Bonjour,
                
                Votre demande d'adhésion a bien été prise en compte.
                Nous sommes actuellement en attente de la confirmation de votre paiement pour finaliser votre inscription.
                
                Sportivement,
                L'AS Hoenheim Sports""";

        this.applicationEventPublisher.publishEvent(new EmailNotificationEvent(
                recipientEmailAddress,
                emailSubject,
                emailBodyContent
        ));
        log.debug("Payment initiated email event published for recipient: {}", recipientEmailAddress);
    }

    /**
     * Sends an email notification when the payment status of a transaction transitions.
     *
     * @param payerInfo    the payment payer details
     * @param targetStatus the new membership payment status
     */
    public void sendPaymentStatusTransitionEmail(PaymentPayerInfo payerInfo, MembershipStatus targetStatus) {
        String recipientEmailAddress = payerInfo.email();
        log.info("Request to send payment status transition email to: {} for status: {}", recipientEmailAddress, targetStatus);
        String emailSubject = "";
        String emailBodyContent = "";

        if (targetStatus == MembershipStatus.PAID) {
            emailSubject = "Confirmation de votre paiement - AS Hoenheim Sports";
            emailBodyContent = """
                    Bonjour,
                    
                    Nous vous confirmons la bonne réception de votre paiement pour votre demande d'adhésion.
                    La validation de votre licence sera traitée ultérieurement.
                    
                    Sportivement,
                    L'AS Hoenheim Sports""";
        } else if (targetStatus == MembershipStatus.FAILED) {
            emailSubject = "Échec de votre paiement - AS Hoenheim Sports";
            emailBodyContent = """
                    Bonjour,
                    
                    Votre tentative de paiement pour votre demande d'adhésion a échoué.
                    Merci de réessayer ou de nous contacter si le problème persiste.
                    
                    Sportivement,
                    L'AS Hoenheim Sports""";
        } else if (targetStatus == MembershipStatus.EXPIRED) {
            emailSubject = "Demande d'adhésion expirée - AS Hoenheim Sports";
            emailBodyContent = """
                    Bonjour,
                    
                    Le délai de paiement pour votre demande d'adhésion a expiré.
                    Votre demande n'a pas pu être validée.
                    
                    Sportivement,
                    L'AS Hoenheim Sports""";
        }

        if (!emailSubject.isEmpty()) {
            this.applicationEventPublisher.publishEvent(new EmailNotificationEvent(
                    recipientEmailAddress,
                    emailSubject,
                    emailBodyContent
            ));
            log.debug("Payment status transition ({}) email event published for recipient: {}", targetStatus, recipientEmailAddress);
        } else {
            log.warn("No transition email sent. Status: {} has no template configured.", targetStatus);
        }
    }

    /**
     * Sends an email notification when a membership licence is validated.
     *
     * @param membership the membership entity being processed
     */
    public void sendLicenceValidatedEmail(Membership membership) {
        String recipientEmailAddress = membership.getEmail().value();
        log.info("Request to send licence validated email to recipient: {} (Membership ID: {})", recipientEmailAddress, membership.getId());
        String emailSubject = "Validation de votre licence - AS Hoenheim Sports";
        String emailBodyContent = """
                Bonjour %s %s,
                
                Nous avons le plaisir de vous informer que votre licence pour la catégorie %s a été validée avec succès.
                
                Sportivement,
                L'AS Hoenheim Sports""".formatted(membership.getFirstName(), membership.getLastName(), membership.getCategory().getName());

        this.applicationEventPublisher.publishEvent(new EmailNotificationEvent(
                recipientEmailAddress,
                emailSubject,
                emailBodyContent
        ));
        log.debug("Licence validated email event published for recipient: {} (Membership ID: {})", recipientEmailAddress, membership.getId());
    }
}

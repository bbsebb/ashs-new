package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.entities.Membership;
import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.events.SumUpPaymentEvent;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Listener for events related to memberships.
 */
@Component
@Slf4j
public class MembershipEventListener {

    private final MembershipRepository membershipRepository;

    public MembershipEventListener(MembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
    }

    /**
     * Handles SumUp payment events to update membership status.
     *
     * @param event the SumUp payment event
     */
    @ApplicationModuleListener
    public void on(SumUpPaymentEvent event) {
        log.info("Received SumUpPaymentEvent for checkoutId: {} with status: {}", event.checkoutId(), event.status());

        List<Membership> memberships = membershipRepository.findByPaymentTransactionSumupCheckoutId(event.checkoutId());
        if (memberships.isEmpty()) {
            log.warn("No membership found for checkoutId: {}", event.checkoutId());
            return;
        }

        String status = event.status();
        MembershipStatus targetStatus;
        if (status.equalsIgnoreCase("PAID") || status.equalsIgnoreCase("SUCCESSFUL")) {
            targetStatus = MembershipStatus.PAID;
        } else if (status.equalsIgnoreCase("FAILED") || status.equalsIgnoreCase("EXPIRED")) {
            targetStatus = MembershipStatus.FAILED;
        } else {
            log.warn("Unknown status received for checkoutId: {}: {}", event.checkoutId(), status);
            return;
        }

        for (Membership membership : memberships) {
            membership.setStatus(targetStatus);
            membershipRepository.save(membership);
            log.info("Membership {} for checkoutId: {} updated to {}", membership.getId(), event.checkoutId(), targetStatus);
        }
    }
}

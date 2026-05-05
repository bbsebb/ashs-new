package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.entities.SumUpCheckoutId;
import fr.hoenheimsports.backend.membershipservice.events.SumUpPaymentEvent;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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

        membershipRepository.findBySumupCheckoutId(new SumUpCheckoutId(event.checkoutId()))
            .ifPresentOrElse(membership -> {
                String status = event.status();
                if (status.equalsIgnoreCase("PAID") || status.equalsIgnoreCase("SUCCESSFUL")) {
                    membership.setStatus(MembershipStatus.PAID);
                    log.info("Membership for checkoutId: {} updated to PAID", event.checkoutId());
                } else if (status.equalsIgnoreCase("FAILED") || status.equalsIgnoreCase("EXPIRED")) {
                    membership.setStatus(MembershipStatus.FAILED);
                    log.info("Membership for checkoutId: {} updated to FAILED", event.checkoutId());
                } else {
                    log.warn("Unknown status received for checkoutId: {}: {}", event.checkoutId(), status);
                    return;
                }
                membershipRepository.save(membership);
            }, () -> log.warn("No membership found for checkoutId: {}", event.checkoutId()));
    }
}

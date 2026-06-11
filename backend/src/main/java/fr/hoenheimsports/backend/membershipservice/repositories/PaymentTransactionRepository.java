package fr.hoenheimsports.backend.membershipservice.repositories;

import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.entities.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for PaymentTransaction entity.
 */
@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
    /**
     * Finds a payment transaction by its SumUp checkout identifier.
     *
     * @param id the SumUp checkout identifier
     * @return an Optional containing the found payment transaction, or empty if not found
     */
    Optional<PaymentTransaction> findBySumupCheckoutId(String id);

    java.util.List<PaymentTransaction> findByCampaignId(UUID campaignId);

    java.util.List<PaymentTransaction> findByStatus(MembershipStatus status);
}

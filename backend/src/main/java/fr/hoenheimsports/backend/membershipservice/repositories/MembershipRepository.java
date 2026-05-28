package fr.hoenheimsports.backend.membershipservice.repositories;

import fr.hoenheimsports.backend.membershipservice.entities.Membership;
import fr.hoenheimsports.backend.membershipservice.entities.SumUpCheckoutId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for Membership entity.
 */
@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    /**
     * Finds memberships by their SumUp checkout identifier.
     *
     * @param sumupCheckoutId the SumUp checkout identifier
     * @return a list of memberships for the checkout identifier
     */
    List<Membership> findByPaymentTransactionSumupCheckoutId(SumUpCheckoutId sumupCheckoutId);

    /**
     * Finds all memberships for a given campaign.
     *
     * @param campaignId the identifier of the campaign
     * @return a list of memberships for the campaign
     */
    List<Membership> findByCampaignId(UUID campaignId);

    List<Membership> findAllByCampaignId(UUID campaignId);
}

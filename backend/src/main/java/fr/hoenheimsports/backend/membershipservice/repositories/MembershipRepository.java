package fr.hoenheimsports.backend.membershipservice.repositories;

import fr.hoenheimsports.backend.membershipservice.entities.Membership;
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
     * @param id the SumUp checkout identifier
     * @return a list of memberships for the checkout identifier
     */
    List<Membership> findByPaymentTransactionSumupCheckoutId(String id);


    /**
     * Finds all memberships associated with a specific campaign.
     *
     * @param campaignId the unique identifier of the campaign
     * @return a list of memberships associated with the campaign
     */
    List<Membership> findAllByCampaignId(UUID campaignId);
}

package fr.hoenheimsports.backend.membershipservice.repositories;

import fr.hoenheimsports.backend.membershipservice.entities.Membership;
import fr.hoenheimsports.backend.membershipservice.entities.SumUpCheckoutId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Membership entity.
 */
@Repository
public interface MembershipRepository extends JpaRepository<Membership, UUID> {
    /**
     * Finds a membership by its SumUp checkout identifier.
     *
     * @param sumupCheckoutId the SumUp checkout identifier
     * @return an Optional containing the found membership, or empty if not found
     */
    Optional<Membership> findBySumupCheckoutId(SumUpCheckoutId sumupCheckoutId);

    /**
     * Finds all memberships for a given campaign.
     *
     * @param campaignId the identifier of the campaign
     * @return a list of memberships for the campaign
     */
    List<Membership> findByCampaignId(UUID campaignId);
}

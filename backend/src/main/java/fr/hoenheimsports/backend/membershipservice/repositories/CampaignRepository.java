package fr.hoenheimsports.backend.membershipservice.repositories;

import fr.hoenheimsports.backend.membershipservice.entities.Campaign;
import fr.hoenheimsports.backend.membershipservice.entities.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Campaign entity.
 */
@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    /**
     * Checks if a campaign exists with the specified status.
     *
     * @param status the campaign status to check
     * @return true if a campaign exists with the status, false otherwise
     */
    boolean existsByStatus(CampaignStatus status);

    /**
     * Finds a campaign by its status.
     *
     * @param status the campaign status
     * @return an Optional containing the campaign if found, or empty
     */
    Optional<Campaign> findByStatus(CampaignStatus status);

    /**
     * Finds all campaigns associated with a specific season.
     *
     * @param seasonUUID the unique identifier of the season
     * @return a list of campaigns associated with the season
     */
    List<Campaign> findAllBySeasonId(UUID seasonUUID);
}

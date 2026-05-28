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
    boolean existsByStatus(CampaignStatus status);
    Optional<Campaign> findByStatus(CampaignStatus status);

    List<Campaign> findAllBySeasonId(UUID seasonUUID);
}

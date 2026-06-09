package fr.hoenheimsports.backend.membershipservice;

import fr.hoenheimsports.backend.membershipservice.entities.Campaign;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * API service exposing campaign-related queries to other modules.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignAPI {
    private final CampaignRepository campaignRepository;

    /**
     * Finds the campaign UUIDs associated with a specific season.
     *
     * @param seasonUUID the unique identifier of the season
     * @return a set of campaign UUIDs associated with the season
     */
    public Set<UUID> findCampaignUUIDBySeasonUUID(UUID seasonUUID) {
        log.info("Request to find campaign UUIDs for season: {}", seasonUUID);
        Set<UUID> campaignIds = this.campaignRepository.findAllBySeasonId(seasonUUID).stream()
                .map(Campaign::getId)
                .collect(Collectors.toSet());
        log.debug("Found {} campaign UUIDs for season: {}", campaignIds.size(), seasonUUID);
        return campaignIds;
    }
}

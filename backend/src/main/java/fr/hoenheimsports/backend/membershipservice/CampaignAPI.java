package fr.hoenheimsports.backend.membershipservice;

import fr.hoenheimsports.backend.membershipservice.entities.Campaign;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignAPI {
    private final CampaignRepository campaignRepository;

    public Set<UUID> findCampaignUUIDBySeasonUUID(UUID seasonUUID) {
        return this.campaignRepository.findAllBySeasonId(seasonUUID).stream().map(Campaign::getId).collect(Collectors.toSet());
    }
}

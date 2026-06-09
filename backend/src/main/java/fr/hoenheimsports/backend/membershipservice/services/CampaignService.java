package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.CampaignCreateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignUpdateRequest;
import fr.hoenheimsports.backend.membershipservice.entities.Campaign;
import fr.hoenheimsports.backend.membershipservice.entities.CampaignStatus;
import fr.hoenheimsports.backend.membershipservice.exceptions.CampaignNotDraftException;
import fr.hoenheimsports.backend.membershipservice.mappers.CampaignMapper;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service responsible for managing membership campaigns.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignMapper campaignMapper;

    /**
     * Retrieves all campaigns.
     *
     * @return a list of CampaignResponse DTOs
     */
    @Transactional(readOnly = true)
    public List<CampaignResponse> getCampaigns() {
        log.debug("Fetching all campaigns from repository");
        List<CampaignResponse> results = campaignRepository.findAll().stream()
                .map(campaignMapper::toResponse)
                .toList();
        log.debug("Fetched {} campaigns", results.size());
        return results;
    }

    /**
     * Retrieves the currently active campaign if one exists.
     *
     * @return an Optional containing the active CampaignResponse
     */
    @Transactional(readOnly = true)
    public java.util.Optional<CampaignResponse> getActiveCampaign() {
        log.debug("Fetching the active campaign (status LAUNCHED)");
        java.util.Optional<CampaignResponse> activeCampaign = campaignRepository.findAll().stream()
                .filter(c -> c.getStatus() == CampaignStatus.LAUNCHED)
                .findFirst()
                .map(campaignMapper::toResponse);
        if (activeCampaign.isPresent()) {
            log.debug("Active campaign found with ID: {}", activeCampaign.get().id());
        } else {
            log.debug("No active campaign found");
        }
        return activeCampaign;
    }

    /**
     * Creates and persists a new campaign.
     *
     * @param request the details to create the campaign
     * @return the created CampaignResponse DTO
     */
    @Transactional
    public CampaignResponse createCampaign(CampaignCreateRequest request) {
        log.info("Creating a new campaign for season: {}", request.seasonId());
        Campaign campaign = new Campaign();
        campaign.setSeasonId(request.seasonId());
        campaign.setStatus(CampaignStatus.DRAFT);
        campaign.setCategories(campaignMapper.toCategorySet(request.categories()));

        Campaign savedCampaign = campaignRepository.save(campaign);
        log.info("Successfully created Campaign with ID: {} in DRAFT status", savedCampaign.getId());

        return campaignMapper.toResponse(savedCampaign);
    }

    /**
     * Updates an existing campaign's configuration.
     *
     * @param campaignId            the unique identifier of the campaign
     * @param campaignUpdateRequest the updated campaign details
     * @return the updated CampaignResponse DTO
     * @throws EntityNotFoundException if the campaign does not exist
     */
    @Transactional
    public CampaignResponse updateCampaign(UUID campaignId, CampaignUpdateRequest campaignUpdateRequest) {
        log.info("Updating categories for campaign with ID: {}", campaignId);
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> {
                    log.warn("Campaign not found for update. ID: {}", campaignId);
                    return new EntityNotFoundException("Campagne non trouvée");
                });
        campaign.setCategories(campaignMapper.toCategorySet(campaignUpdateRequest.categories()));
        Campaign updatedCampaign = campaignRepository.save(campaign);
        log.info("Successfully updated campaign with ID: {}", campaignId);
        return campaignMapper.toResponse(updatedCampaign);
    }

    /**
     * Launches a campaign by updating its status to LAUNCHED.
     *
     * @param campaignId the unique identifier of the campaign to launch
     * @throws EntityNotFoundException if the campaign is not found
     */
    @Transactional
    public void launchCampaign(UUID campaignId) {
        log.info("Launching campaign with ID: {}", campaignId);
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> {
                    log.warn("Campaign not found for launch. ID: {}", campaignId);
                    return new EntityNotFoundException("Campagne non trouvée");
                });

        campaign.setStatus(CampaignStatus.LAUNCHED);
        campaignRepository.save(campaign);
        log.info("Campaign with ID: {} is now LAUNCHED", campaignId);
    }

    /**
     * Closes a campaign by updating its status to CLOSED.
     *
     * @param campaignId the unique identifier of the campaign to close
     * @throws EntityNotFoundException if the campaign is not found
     */
    @Transactional
    public void closeCampaign(UUID campaignId) {
        log.info("Closing campaign with ID: {}", campaignId);
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> {
                    log.warn("Campaign not found for closing. ID: {}", campaignId);
                    return new EntityNotFoundException("Campagne non trouvée");
                });

        campaign.setStatus(CampaignStatus.CLOSED);
        campaignRepository.save(campaign);
        log.info("Campaign with ID: {} is now CLOSED", campaignId);
    }

    /**
     * Deletes a campaign if it is currently in DRAFT status.
     *
     * @param campaignId the unique identifier of the campaign to delete
     * @throws EntityNotFoundException     if the campaign is not found
     * @throws CampaignNotDraftException if the campaign is not in DRAFT status
     */
    @Transactional
    public void deleteCampaign(UUID campaignId) {
        log.info("Deleting campaign with ID: {}", campaignId);
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> {
                    log.warn("Campaign not found for deletion. ID: {}", campaignId);
                    return new EntityNotFoundException("Campagne non trouvée");
                });
        if (campaign.getStatus() != CampaignStatus.DRAFT) {
            log.warn("Cannot delete campaign {}. Status is: {}", campaignId, campaign.getStatus());
            throw new CampaignNotDraftException("La campagne doit être en statut DRAFT pour être supprimée");
        }
        campaignRepository.delete(campaign);
        log.info("Successfully deleted campaign with ID: {}", campaignId);
    }
}

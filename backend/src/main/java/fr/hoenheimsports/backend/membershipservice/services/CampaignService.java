package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.CampaignCreateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignUpdateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.CategoryDto;
import fr.hoenheimsports.backend.membershipservice.entities.Campaign;
import fr.hoenheimsports.backend.membershipservice.entities.CampaignStatus;
import fr.hoenheimsports.backend.membershipservice.entities.Category;
import fr.hoenheimsports.backend.membershipservice.entities.Price;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;

    @Transactional(readOnly = true)
    public List<CampaignResponse> getCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CampaignResponse createCampaign(CampaignCreateRequest request) {
        Campaign campaign = new Campaign();
        campaign.setSeasonId(request.seasonId());
        campaign.setStatus(CampaignStatus.DRAFT);
        campaign.setCategories(request.categories().stream()
            .map(dto -> new Category(dto.name(), Price.of(dto.amount())))
            .collect(Collectors.toSet()));

        Campaign savedCampaign = campaignRepository.save(campaign);

        return toResponse(savedCampaign);
    }

    @Transactional
    public CampaignResponse updateCampaign(UUID campaignId, CampaignUpdateRequest campaignUpdateRequest) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new EntityNotFoundException("Campagne non trouvée"));
        campaign.setCategories(campaignUpdateRequest.categories().stream()
                .map(dto -> new Category(dto.name(), Price.of(dto.amount())))
                .collect(Collectors.toSet()));
        return toResponse(campaignRepository.save(campaign));
    }



    @Transactional
    public void launchCampaign(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new EntityNotFoundException("Campagne non trouvée"));

        if (campaignRepository.existsByStatus(CampaignStatus.LAUNCHED)) {
            throw new IllegalStateException("Une campagne est déjà lancée");
        }

        campaign.setStatus(CampaignStatus.LAUNCHED);
        campaignRepository.save(campaign);
    }

    @Transactional(readOnly = true)
    public Optional<CampaignResponse> getActiveCampaign() {
        return campaignRepository.findByStatus(CampaignStatus.LAUNCHED)
            .map(this::toResponse);
    }

    private CampaignResponse toResponse(Campaign campaign) {
        return new CampaignResponse(
            campaign.getId(),
            campaign.getSeasonId(),
            campaign.getStatus(),
            campaign.getCategories().stream()
                .map(cat -> new CategoryDto(cat.getName(), cat.getPrice().amount()))
                .collect(Collectors.toSet())
        );
    }

    @Transactional
    public void deleteCampaign(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new EntityNotFoundException("Campagne non trouvée"));
        campaignRepository.delete(campaign);
    }
}

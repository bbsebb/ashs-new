package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.CampaignCreateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.CategoryDto;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CampaignService Unit Tests")
class CampaignServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @InjectMocks
    private CampaignService campaignService;

    @Test
    @DisplayName("Should successfully create a campaign")
    void shouldCreateCampaign() {
        // Given
        UUID seasonId = UUID.randomUUID();
        CampaignCreateRequest request = new CampaignCreateRequest(
            seasonId,
            Set.of(new CategoryDto("U11", new BigDecimal("100.00")))
        );
        when(campaignRepository.save(any())).thenAnswer(invocation -> {
            Campaign c = invocation.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        // When
        CampaignResponse response = campaignService.createCampaign(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.seasonId()).isEqualTo(seasonId);
        verify(campaignRepository).save(any());
    }

    @Test
    @DisplayName("Should successfully launch a campaign")
    void shouldLaunchCampaign() {
        // Given
        UUID campaignId = UUID.randomUUID();
        Campaign campaign = new Campaign();
        campaign.setId(campaignId);
        campaign.setStatus(CampaignStatus.DRAFT);

        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
        when(campaignRepository.existsByStatus(CampaignStatus.LAUNCHED)).thenReturn(false);
        when(campaignRepository.save(any())).thenReturn(campaign);

        // When
        campaignService.launchCampaign(campaignId);

        // Then
        assertThat(campaign.getStatus()).isEqualTo(CampaignStatus.LAUNCHED);
        verify(campaignRepository).save(campaign);
    }

    @Test
    @DisplayName("Should throw exception when launching campaign if another one is already launched")
    void shouldThrowExceptionWhenAnotherCampaignIsLaunched() {
        // Given
        UUID campaignId = UUID.randomUUID();
        Campaign campaign = new Campaign();
        campaign.setId(campaignId);
        campaign.setStatus(CampaignStatus.DRAFT);

        when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
        when(campaignRepository.existsByStatus(CampaignStatus.LAUNCHED)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> campaignService.launchCampaign(campaignId))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Une campagne est déjà lancée");
    }

    @Test
    @DisplayName("Should return the active campaign")
    void shouldReturnActiveCampaign() {
        // Given
        Campaign campaign = new Campaign();
        campaign.setId(UUID.randomUUID());
        campaign.setSeasonId(UUID.randomUUID());
        campaign.setStatus(CampaignStatus.LAUNCHED);
        campaign.setCategories(Set.of(new Category("U11", Price.of("100.00"))));

        when(campaignRepository.findByStatus(CampaignStatus.LAUNCHED)).thenReturn(Optional.of(campaign));

        // When
        Optional<CampaignResponse> response = campaignService.getActiveCampaign();

        // Then
        assertThat(response).isPresent();
        assertThat(response.get().status()).isEqualTo(CampaignStatus.LAUNCHED);
    }
}

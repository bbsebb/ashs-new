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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
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

    @Nested
    @DisplayName("Create Campaign")
    class CreateCampaign {
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
            assertThat(response.categories()).hasSize(1);
            assertThat(response.status()).isEqualTo(CampaignStatus.DRAFT);
            verify(campaignRepository).save(any());
        }
    }

    @Nested
    @DisplayName("Get All Campaigns")
    class GetCampaigns {
        @Test
        @DisplayName("Should return a list of all campaigns")
        void shouldGetAllCampaigns() {
            // Given
            Campaign campaign1 = new Campaign();
            campaign1.setId(UUID.randomUUID());
            campaign1.setSeasonId(UUID.randomUUID());
            campaign1.setStatus(CampaignStatus.DRAFT);
            campaign1.setCategories(Set.of());

            Campaign campaign2 = new Campaign();
            campaign2.setId(UUID.randomUUID());
            campaign2.setSeasonId(UUID.randomUUID());
            campaign2.setStatus(CampaignStatus.LAUNCHED);
            campaign2.setCategories(Set.of());

            when(campaignRepository.findAll()).thenReturn(List.of(campaign1, campaign2));

            // When
            List<CampaignResponse> response = campaignService.getCampaigns();

            // Then
            assertThat(response).hasSize(2);
            verify(campaignRepository).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no campaigns exist")
        void shouldReturnEmptyList() {
            // Given
            when(campaignRepository.findAll()).thenReturn(List.of());

            // When
            List<CampaignResponse> response = campaignService.getCampaigns();

            // Then
            assertThat(response).isEmpty();
        }
    }

    @Nested
    @DisplayName("Update Campaign")
    class UpdateCampaign {
        @Test
        @DisplayName("Should successfully update a campaign")
        void shouldUpdateCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();
            UUID seasonId = UUID.randomUUID();

            Campaign existingCampaign = new Campaign();
            existingCampaign.setId(campaignId);
            existingCampaign.setSeasonId(seasonId);
            existingCampaign.setStatus(CampaignStatus.DRAFT);
            existingCampaign.setCategories(Set.of(
                    new Category("U9", Price.of("80.00")),
                    new Category("U13", Price.of("120.00"))
            ));

            CampaignUpdateRequest request = new CampaignUpdateRequest(
                    Set.of(new CategoryDto("U11", new BigDecimal("100.00")))
            );

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(existingCampaign));
            when(campaignRepository.save(any(Campaign.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // When
            CampaignResponse response = campaignService.updateCampaign(campaignId, request);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.seasonId()).isEqualTo(seasonId);
            assertThat(response.status()).isEqualTo(CampaignStatus.DRAFT);
            assertThat(response.categories()).hasSize(1);
            assertThat(response.categories()).first().extracting(CategoryDto::name).isEqualTo("U11");

            ArgumentCaptor<Campaign> campaignCaptor = ArgumentCaptor.forClass(Campaign.class);
            verify(campaignRepository).save(campaignCaptor.capture());
            assertThat(campaignCaptor.getValue().getCategories()).hasSize(1);
        }

        @Test
        @DisplayName("Should throw exception when campaign is not found during update")
        void shouldThrowExceptionWhenCampaignNotFound() {
            // Given
            UUID campaignId = UUID.randomUUID();
            CampaignUpdateRequest request = new CampaignUpdateRequest(Set.of());

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> campaignService.updateCampaign(campaignId, request))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Campagne non trouvée");

        }
    }

    @Nested
    @DisplayName("Launch Campaign")
    class LaunchCampaign {
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

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
            when(campaignRepository.existsByStatus(CampaignStatus.LAUNCHED)).thenReturn(true);

            // When & Then
            assertThatThrownBy(() -> campaignService.launchCampaign(campaignId))
                    .isInstanceOf(IllegalStateException.class);
        }
    }

    @Nested
    @DisplayName("Get Active Campaign")
    class GetActiveCampaign {
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

    @Nested
    @DisplayName("Delete Campaign")
    class DeleteCampaign {
        @Test
        @DisplayName("Should successfully delete a campaign")
        void shouldDeleteCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();
            Campaign campaign = new Campaign();
            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

            // When
            campaignService.deleteCampaign(campaignId);

            // Then
            verify(campaignRepository).delete(campaign);
        }

        @Test
        @DisplayName("Should throw exception when campaign is not found during deletion")
        void shouldThrowExceptionWhenCampaignNotFound() {
            // Given
            UUID campaignId = UUID.randomUUID();
            when(campaignRepository.findById(campaignId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> campaignService.deleteCampaign(campaignId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Campagne non trouvée");
        }
    }
}

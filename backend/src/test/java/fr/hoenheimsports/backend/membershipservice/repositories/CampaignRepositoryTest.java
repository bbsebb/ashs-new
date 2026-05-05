package fr.hoenheimsports.backend.membershipservice.repositories;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.membershipservice.entities.Campaign;
import fr.hoenheimsports.backend.membershipservice.entities.CampaignStatus;
import fr.hoenheimsports.backend.membershipservice.entities.Category;
import fr.hoenheimsports.backend.membershipservice.entities.Price;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("CampaignRepository Tests")
class CampaignRepositoryTest {

    @Autowired
    private CampaignRepository campaignRepository;

    @Nested
    @DisplayName("Basic CRUD Operations")
    class CrudOperations {

        @Test
        @DisplayName("Should save and find a campaign by ID")
        void shouldSaveAndFindCampaignById() {
            // Given
            Campaign campaign = new Campaign();
            campaign.setSeasonId(UUID.randomUUID());
            campaign.setStatus(CampaignStatus.DRAFT);
            campaign.setCategories(Set.of(
                new Category("U11", Price.of("100.00")),
                new Category("U13", Price.of("120.00"))
            ));

            // When
            Campaign savedCampaign = campaignRepository.saveAndFlush(campaign);
            Optional<Campaign> foundCampaign = campaignRepository.findById(savedCampaign.getId());

            // Then
            assertThat(foundCampaign).isPresent();
            assertThat(foundCampaign.get().getId()).isNotNull();
            assertThat(foundCampaign.get().getSeasonId()).isEqualTo(campaign.getSeasonId());
            assertThat(foundCampaign.get().getStatus()).isEqualTo(campaign.getStatus());
            assertThat(foundCampaign.get().getCategories()).containsExactlyInAnyOrderElementsOf(campaign.getCategories());
        }
    }
}

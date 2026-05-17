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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("CampaignRepository Tests")
class CampaignRepositoryTest {

    @Autowired
    private CampaignRepository campaignRepository;

    @Nested
    @DisplayName("CRUD Operations")
    class CrudOperations {

        @Test
        @DisplayName("Should save and find a campaign with all its attributes")
        void shouldSaveAndFindCampaign() {
            // Given
            UUID seasonId = UUID.randomUUID();
            Campaign campaign = new Campaign();
            campaign.setSeasonId(seasonId);
            campaign.setStatus(CampaignStatus.DRAFT);
            campaign.setCategories(Set.of(
                    new Category("Sénior", Price.of("150.00")),
                    new Category("U11", Price.of("100.00"))
            ));

            // When
            Campaign savedCampaign = campaignRepository.saveAndFlush(campaign);
            Optional<Campaign> foundCampaign = campaignRepository.findById(savedCampaign.getId());

            // Then
            assertThat(foundCampaign).isPresent();
            assertThat(foundCampaign.get().getId()).isNotNull();
            assertThat(foundCampaign.get().getSeasonId()).isEqualTo(seasonId);
            assertThat(foundCampaign.get().getStatus()).isEqualTo(CampaignStatus.DRAFT);
            assertThat(foundCampaign.get().getCategories()).hasSize(2)
                    .extracting(Category::getName)
                    .containsExactlyInAnyOrder("Sénior", "U11");

            Category senior = foundCampaign.get().getCategories().stream()
                    .filter(c -> c.getName().equals("Sénior"))
                    .findFirst().orElseThrow();
            assertThat(senior.getPrice().amount()).isEqualByComparingTo("150.00");
        }

        @Test
        @DisplayName("Should fail to save when seasonId is null")
        void shouldFailWhenSeasonIdIsNull() {
            Campaign campaign = new Campaign();
            campaign.setStatus(CampaignStatus.DRAFT);

            assertThatThrownBy(() -> campaignRepository.saveAndFlush(campaign))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should fail to save when status is null")
        void shouldFailWhenStatusIsNull() {
            Campaign campaign = new Campaign();
            campaign.setSeasonId(UUID.randomUUID());

            assertThatThrownBy(() -> campaignRepository.saveAndFlush(campaign))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }
    }

    @Nested
    @DisplayName("Custom Queries")
    class CustomQueries {

        @Test
        @DisplayName("existsByStatus should return true when a campaign with the given status exists")
        void existsByStatusShouldReturnTrue() {
            // Given
            Campaign campaign = new Campaign();
            campaign.setSeasonId(UUID.randomUUID());
            campaign.setStatus(CampaignStatus.LAUNCHED);
            campaignRepository.saveAndFlush(campaign);

            // When
            boolean exists = campaignRepository.existsByStatus(CampaignStatus.LAUNCHED);

            // Then
            assertThat(exists).isTrue();
        }

        @Test
        @DisplayName("existsByStatus should return false when no campaign with the given status exists")
        void existsByStatusShouldReturnFalse() {
            // When
            boolean exists = campaignRepository.existsByStatus(CampaignStatus.LAUNCHED);

            // Then
            assertThat(exists).isFalse();
        }

        @Test
        @DisplayName("findByStatus should return the campaign with the given status")
        void findByStatusShouldReturnCampaign() {
            // Given
            Campaign campaign = new Campaign();
            campaign.setSeasonId(UUID.randomUUID());
            campaign.setStatus(CampaignStatus.LAUNCHED);
            campaignRepository.saveAndFlush(campaign);

            // When
            Optional<Campaign> found = campaignRepository.findByStatus(CampaignStatus.LAUNCHED);

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getStatus()).isEqualTo(CampaignStatus.LAUNCHED);
        }
    }
}

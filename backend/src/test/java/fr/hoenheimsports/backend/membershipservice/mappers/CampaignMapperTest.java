package fr.hoenheimsports.backend.membershipservice.mappers;

import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.CategoryDto;
import fr.hoenheimsports.backend.membershipservice.entities.Campaign;
import fr.hoenheimsports.backend.membershipservice.entities.CampaignStatus;
import fr.hoenheimsports.backend.membershipservice.entities.Category;
import fr.hoenheimsports.backend.membershipservice.entities.Price;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CampaignMapper Unit Tests")
class CampaignMapperTest {

    private final CampaignMapper mapper = Mappers.getMapper(CampaignMapper.class);

    @Test
    @DisplayName("Should map Campaign to CampaignResponse DTO")
    void shouldMapCampaignToResponse() {
        // Given
        UUID campaignId = UUID.randomUUID();
        UUID seasonId = UUID.randomUUID();
        Campaign campaign = new Campaign();
        campaign.setId(campaignId);
        campaign.setSeasonId(seasonId);
        campaign.setStatus(CampaignStatus.LAUNCHED);
        campaign.setCategories(Set.of(new Category("U11", Price.of("100.00"))));

        // When
        CampaignResponse response = mapper.toResponse(campaign);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(campaignId);
        assertThat(response.seasonId()).isEqualTo(seasonId);
        assertThat(response.status()).isEqualTo(CampaignStatus.LAUNCHED);
        assertThat(response.categories()).hasSize(1);
        assertThat(response.categories()).first().satisfies(dto -> {
            assertThat(dto.name()).isEqualTo("U11");
            assertThat(dto.amount()).isEqualByComparingTo("100.00");
        });
    }

    @Test
    @DisplayName("Should map CategoryDto to Category entity")
    void shouldMapCategoryDtoToCategory() {
        // Given
        CategoryDto dto = new CategoryDto("U13", new BigDecimal("120.00"));

        // When
        Category entity = mapper.toCategory(dto);

        // Then
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("U13");
        assertThat(entity.getPrice()).isNotNull();
        assertThat(entity.getPrice().amount()).isEqualByComparingTo("120.00");
    }
}

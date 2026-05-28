package fr.hoenheimsports.backend.seasonservice.services;

import fr.hoenheimsports.backend.membershipservice.CampaignAPI;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonUpdateRequest;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import fr.hoenheimsports.backend.seasonservice.exceptions.SeasonInUseException;
import fr.hoenheimsports.backend.seasonservice.mappers.SeasonMapper;
import fr.hoenheimsports.backend.seasonservice.repositories.SeasonRepository;
import fr.hoenheimsports.backend.shared.exceptions.RangeDateException;
import fr.hoenheimsports.backend.teamservice.TeamAPI;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeasonServiceTest {

    @Mock
    private SeasonRepository seasonRepository;

    @Mock
    private SeasonMapper seasonMapper;

    @Mock
    private TeamAPI teamAPI;


    @Mock
    private CampaignAPI campaignAPI;

    @InjectMocks
    private SeasonService seasonService;

    @Test
    void createSeason_ShouldSucceed_WhenDatesAreValid() {
        // Arrange
        LocalDate start = LocalDate.of(2025, 1, 1);
        LocalDate end = LocalDate.of(2025, 12, 31);
        SeasonCreateRequest request = new SeasonCreateRequest(start, end);
        Season season = new Season();
        season.setStartDate(start);
        season.setEndDate(end);

        when(seasonMapper.toEntity(request)).thenReturn(season);
        when(seasonRepository.save(any(Season.class))).thenReturn(season);
        when(seasonMapper.toDto(any(Season.class))).thenReturn(new SeasonResponse(UUID.randomUUID(), start, end, "Saison 2025 - 2025", false));

        // Act
        SeasonResponse response = seasonService.createSeason(request);

        // Assert
        assertThat(response).isNotNull();
        verify(seasonRepository).save(any(Season.class));
    }

    @Test
    void createSeason_ShouldThrowException_WhenStartDateIsAfterEndDate() {
        // Arrange
        LocalDate start = LocalDate.of(2025, 12, 31);
        LocalDate end = LocalDate.of(2025, 1, 1);
        SeasonCreateRequest request = new SeasonCreateRequest(start, end);

        // Act & Assert
        assertThatThrownBy(() -> seasonService.createSeason(request))
                .isInstanceOf(RangeDateException.class)
                .hasMessageContaining("La date de début doit être antérieure à la date de fin");
    }

    @Test
    void updateSeason_ShouldThrowException_WhenUpdatedDatesAreInvalid() {
        // Arrange
        UUID id = UUID.randomUUID();
        LocalDate start = LocalDate.of(2025, 12, 31);
        LocalDate end = LocalDate.of(2025, 1, 1);
        SeasonUpdateRequest request = new SeasonUpdateRequest(start, end);

        // Act & Assert
        // CE TEST DEVRAIT ÉCHOUER car le code actuel de updateSeason ne vérifie pas l'intervalle
        assertThatThrownBy(() -> seasonService.updateSeason(id, request))
                .isInstanceOf(RangeDateException.class)
                .hasMessageContaining("La date de début doit être antérieure à la date de fin");
    }

    @Test
    void deleteById_ShouldThrowException_WhenSeasonIsInUseInTeam() {
        // Arrange
        UUID id = UUID.randomUUID();
        Season season = new Season();
        season.setId(id);

        when(seasonRepository.findById(id)).thenReturn(Optional.of(season));
        when(teamAPI.findTeamUUIDBySeasonUUID(id)).thenReturn(Collections.singleton(UUID.randomUUID()));
        when(campaignAPI.findCampaignUUIDBySeasonUUID(id)).thenReturn(Set.of());

        // Act & Assert
        assertThatThrownBy(() -> seasonService.deleteById(id))
                .isInstanceOf(SeasonInUseException.class)
                .hasMessageContaining("La saison est utilisée par des équipes ou campagnes et ne peut pas être supprimée");
    }

    @Test
    void deleteById_ShouldThrowException_WhenSeasonIsInUseInCampaign() {
        // Arrange
        UUID id = UUID.randomUUID();
        Season season = new Season();
        season.setId(id);

        when(seasonRepository.findById(id)).thenReturn(Optional.of(season));
        when(teamAPI.findTeamUUIDBySeasonUUID(id)).thenReturn(Set.of());
        when(campaignAPI.findCampaignUUIDBySeasonUUID(id)).thenReturn(Collections.singleton(UUID.randomUUID()));

        // Act & Assert
        assertThatThrownBy(() -> seasonService.deleteById(id))
                .isInstanceOf(SeasonInUseException.class)
                .hasMessageContaining("La saison est utilisée par des équipes ou campagnes et ne peut pas être supprimée");
    }

    @Test
    void deleteById_ShouldSucceed_WhenNoAssociations() {
        // Arrange
        UUID id = UUID.randomUUID();
        Season season = new Season();
        season.setId(id);

        when(seasonRepository.findById(id)).thenReturn(Optional.of(season));
        when(teamAPI.findTeamUUIDBySeasonUUID(id)).thenReturn(Collections.emptySet());

        // Act
        seasonService.deleteById(id);

        // Assert
        verify(seasonRepository).delete(season);
    }
}

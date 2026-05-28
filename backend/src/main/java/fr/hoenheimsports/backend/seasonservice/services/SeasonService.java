package fr.hoenheimsports.backend.seasonservice.services;

import fr.hoenheimsports.backend.membershipservice.CampaignAPI;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonUpdateRequest;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import fr.hoenheimsports.backend.seasonservice.exceptions.SeasonInUseException;
import fr.hoenheimsports.backend.seasonservice.mappers.SeasonMapper;
import fr.hoenheimsports.backend.seasonservice.repositories.SeasonRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.shared.exceptions.RangeDateException;
import fr.hoenheimsports.backend.teamservice.TeamAPI;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Service managing season lifecycle and activities.
 * Provides functionality for creating, updating, listing, and deleting seasons
 * with integrated safety checks for associations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SeasonService {
    private final SeasonRepository seasonRepository;
    private final SeasonMapper seasonMapper;
    private final TeamAPI teamAPI;
    private final CampaignAPI campaignAPI;

    /**
     * Retrieves all seasons.
     *
     * @return a list of all seasons as response DTOs
     */
    public List<SeasonResponse> getAllSeasons() {
        log.debug("Appel de getAllSeasons");
        var seasons = seasonRepository.findAll().stream()
                .map(this.seasonMapper::toDto)
                .toList();
        log.debug("Retour de getAllSeasons - Nombre de saison : {}", seasons.size());
        return seasons;
    }

    /**
     * Deletes a season by ID if it has no associated teams.
     *
     * @param uuid the unique identifier of the season to delete
     * @throws EntityNotFoundException if the season does not exist
     * @throws SeasonInUseException    if the season is associated with existing teams
     */
    public void deleteById(UUID uuid) {
        log.debug("Tentative de suppression de la saison avec l'ID : {}", uuid);
        var season = seasonRepository.findById(uuid).orElseThrow(() -> new EntityNotFoundException("La saison n'a pas été trouvée ou n'existe plus."));
        assertSeasonHasNoAssociations(season);
        seasonRepository.delete(season);
        log.info("Saison supprimée : {}", uuid);
    }

    private void assertSeasonHasNoAssociations(Season season) {
        int numberOfTeamBySeason = this.teamAPI.findTeamUUIDBySeasonUUID(season.getId()).size();
        int numberOfCampaignBySeason = this.campaignAPI.findCampaignUUIDBySeasonUUID(season.getId()).size();
        if (numberOfTeamBySeason + numberOfCampaignBySeason > 0) {
            throw new SeasonInUseException("La saison est utilisée par des équipes ou campagnes et ne peut pas être supprimée");
        }
    }

    /**
     * Creates and persists a new season.
     *
     * @param seasonCreateRequest the details of the new season
     * @return the created season's DTO
     * @throws RangeDateException if the start date is after the end date
     */
    public SeasonResponse createSeason(SeasonCreateRequest seasonCreateRequest) {
        log.debug(
                "Tentative de création d'une saison du : {} au : {}",
                seasonCreateRequest.startDate().format(DateTimeFormatter.BASIC_ISO_DATE),
                seasonCreateRequest.endDate().format(DateTimeFormatter.BASIC_ISO_DATE)
        );
        assertValidDateRange(seasonCreateRequest.startDate(), seasonCreateRequest.endDate());
        var season = seasonMapper.toEntity(seasonCreateRequest);
        season.setName(createSeasonName(season.getStartDate(), season.getEndDate()));
        var response = seasonMapper.toDto(seasonRepository.save(season));
        log.info("Saison créée avec succès : ID {}", response.id());
        return response;
    }

    /**
     * Updates an existing season's timeframe and name.
     *
     * @param id the unique identifier of the season to update
     * @param seasonUpdateRequest the updated season details
     * @return the updated season's DTO
     * @throws EntityNotFoundException if the season does not exist
     * @throws RangeDateException if the start date is after the end date
     */
    public SeasonResponse updateSeason(UUID id, SeasonUpdateRequest seasonUpdateRequest) {
        log.debug(
                "Tentative de mise à jour d'une saison du : {} au : {}",
                seasonUpdateRequest.startDate().format(DateTimeFormatter.BASIC_ISO_DATE),
                seasonUpdateRequest.endDate().format(DateTimeFormatter.BASIC_ISO_DATE)
        );
        assertValidDateRange(seasonUpdateRequest.startDate(), seasonUpdateRequest.endDate());
        var errorMessage = "La saison du %s au %s n'existe pas ou n'a pas été trouvée".formatted(seasonUpdateRequest.startDate(), seasonUpdateRequest.endDate());
        var season = seasonRepository.findById(id).orElseThrow(() -> new EntityNotFoundException(errorMessage));
        season.setStartDate(seasonUpdateRequest.startDate());
        season.setEndDate(seasonUpdateRequest.endDate());
        season.setName(createSeasonName(season.getStartDate(), season.getEndDate()));
        log.info("Mise à jour de la saison : {}", id);
        return seasonMapper.toDto(seasonRepository.save(season));
    }

    private void assertValidDateRange(LocalDate startDate, LocalDate endDate) {
        if (!startDate.isBefore(endDate)) {
            throw new RangeDateException("La date de début doit être antérieure à la date de fin");
        }
    }

    private String createSeasonName(LocalDate startDate, LocalDate endDate) {
        return "Saison %d - %d".formatted(startDate.getYear(), endDate.getYear());
    }


}

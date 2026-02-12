package fr.hoenheimsports.backend.seasonservice.services;

import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonEditRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import fr.hoenheimsports.backend.seasonservice.mappers.SeasonMapper;
import fr.hoenheimsports.backend.seasonservice.repositories.SeasonRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.shared.exceptions.RangeDateException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeasonService {
    private final SeasonRepository seasonRepository;
    private final SeasonMapper seasonMapper;

    public List<SeasonResponse> getAllSeasons() {
        log.debug("Appel de getAllSeasons");
        var seasons =  seasonRepository.findAll().stream()
                .map(this.seasonMapper::toDto)
                .toList();
        log.debug("Retour de getAllSeasons - Nombre de saison : {}", seasons.size());
        return seasons;
    }

    public void deleteById(UUID uuid) {
        log.debug("Tentative de suppression de la saison avec l'ID : {}", uuid);
        var hall = seasonRepository.findById(uuid).orElseThrow(() -> new EntityNotFoundException("La salle n'a pas été trouvé ou n'existe plus."));
        seasonRepository.delete(hall);
        log.info("Saison supprimée : {}", uuid);
    }

    public SeasonResponse createSeason(SeasonCreateRequest seasonCreateRequest) {
        log.debug(
                "Tentative de création d'une saison du : {} au : {}",
                seasonCreateRequest.startDate().format(DateTimeFormatter.BASIC_ISO_DATE),
                seasonCreateRequest.endDate().format(DateTimeFormatter.BASIC_ISO_DATE)
                );
        if(seasonCreateRequest.startDate().isAfter(seasonCreateRequest.endDate())) {
            throw new RangeDateException("La date de début doit être antérieure à la date de fin");
        }
        var season = seasonMapper.toEntity(seasonCreateRequest);
        season.setName(createSeasonName(season.getStartDate(), season.getEndDate()));
        var response = seasonMapper.toDto(seasonRepository.save(season));
        log.info("Saison créée avec succès : ID {}", response.id());
        return response;
    }

    public SeasonResponse editSeason(UUID id, SeasonEditRequest seasonEditRequest) {
        log.debug(
                "Tentative de mise à jour d'une saison du : {} au : {}",
                seasonEditRequest.startDate().format(DateTimeFormatter.BASIC_ISO_DATE),
                seasonEditRequest.endDate().format(DateTimeFormatter.BASIC_ISO_DATE)
        );
        var errorMessage = "La saison du %s au %s n'existe pas ou n'a pas été trouvée".formatted(seasonEditRequest.startDate(), seasonEditRequest.endDate());
        var season = seasonRepository.findById(id).orElseThrow(() -> new EntityNotFoundException(errorMessage));
        season.setStartDate(seasonEditRequest.startDate());
        season.setEndDate(seasonEditRequest.endDate());
        season.setName(createSeasonName(season.getStartDate(), season.getEndDate()));
        log.info("Mise à jour de la salle : {}", id);
        return seasonMapper.toDto(seasonRepository.save(season));
    }

    private String createSeasonName(LocalDate startDate, LocalDate endDate) {
        return "Saison %d - %d".formatted(startDate.getYear(), endDate.getYear());
    }


}

package fr.hoenheimsports.backend.seasonservice.controllers;

import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonUpdateRequest;
import fr.hoenheimsports.backend.seasonservice.services.SeasonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller providing API endpoints for managing seasons.
 */
@RestController
@RequestMapping("/api/v1/seasons")
@RequiredArgsConstructor
@Slf4j
public class SeasonController {
    /**
     * Service handling business operations for seasons.
     */
    private final SeasonService seasonService;

    /**
     * Retrieves all configured seasons.
     *
     * @return a response entity containing the list of season responses
     */
    @GetMapping
    public ResponseEntity<List<SeasonResponse>> getAllSeasons() {
        log.debug("Entering getAllSeasons");
        List<SeasonResponse> responses = seasonService.getAllSeasons();
        log.info("Successfully retrieved {} seasons", responses.size());
        return ResponseEntity.ok(responses);
    }

    /**
     * Creates a new season.
     *
     * @param seasonCreateRequest the details of the season to create
     * @return a response entity containing the created season response
     */
    @PostMapping
    public ResponseEntity<SeasonResponse> createSeason(@RequestBody @Valid SeasonCreateRequest seasonCreateRequest) {
        log.debug("Entering createSeason with request: {}", seasonCreateRequest);
        SeasonResponse response = seasonService.createSeason(seasonCreateRequest);
        log.info("Successfully created season with name: {}", response.name());
        return ResponseEntity.ok(response);
    }

    /**
     * Updates an existing season.
     *
     * @param id                  the unique identifier of the season to update
     * @param seasonUpdateRequest the details to update in the season
     * @return a response entity containing the updated season response
     */
    @PutMapping("/{id}")
    public ResponseEntity<SeasonResponse> updateSeason(@PathVariable UUID id, @RequestBody @Valid SeasonUpdateRequest seasonUpdateRequest) {
        log.debug("Entering updateSeason with ID: {} and request: {}", id, seasonUpdateRequest);
        SeasonResponse response = seasonService.updateSeason(id, seasonUpdateRequest);
        log.info("Successfully updated season with ID: {}", id);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a season by its unique identifier.
     *
     * @param id the unique identifier of the season to delete
     * @return a response entity indicating the operation's completion (no content)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeasonById(@PathVariable UUID id) {
        log.debug("Entering deleteSeasonById with ID: {}", id);
        seasonService.deleteById(id);
        log.info("Successfully deleted season with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}

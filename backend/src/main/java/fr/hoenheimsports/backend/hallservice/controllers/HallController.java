package fr.hoenheimsports.backend.hallservice.controllers;

import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.hallservice.dtos.HallUpdateRequest;
import fr.hoenheimsports.backend.hallservice.services.HallService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller providing API endpoints for managing physical halls/gymnasiums.
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/halls")
public class HallController {

    /**
     * Service handling business operations on halls.
     */
    private final HallService hallService;

    /**
     * Retrieves a list of all available halls.
     *
     * @return a response entity containing the list of hall responses
     */
    @GetMapping
    public ResponseEntity<List<HallResponse>> getAllHalls() {
        log.debug("Entering getAllHalls");
        log.info("Récupération de tous les gymnases");
        List<HallResponse> responses = hallService.getAllHalls();
        log.info("Successfully retrieved {} halls", responses.size());
        return ResponseEntity.ok(responses);
    }

    /**
     * Creates a new hall from the provided request payload.
     *
     * @param hallCreateRequest the data required to create a new hall
     * @return a response entity containing the created hall response
     */
    @PostMapping
    public ResponseEntity<HallResponse> createHall(@RequestBody @Valid HallCreateRequest hallCreateRequest) {
        log.debug("Entering createHall with request: {}", hallCreateRequest);
        HallResponse response = hallService.createHall(hallCreateRequest);
        log.info("Successfully created hall with name: {}", hallCreateRequest.name());
        return ResponseEntity.ok(response);
    }

    /**
     * Updates an existing hall identification with updated values.
     *
     * @param id                the unique identifier of the hall to update
     * @param hallUpdateRequest the details to update in the hall
     * @return a response entity containing the updated hall response
     */
    @PutMapping("/{id}")
    public ResponseEntity<HallResponse> updateHall(@PathVariable UUID id, @RequestBody @Valid HallUpdateRequest hallUpdateRequest) {
        log.debug("Entering updateHall with ID: {} and request: {}", id, hallUpdateRequest);
        HallResponse response = hallService.updateHall(id, hallUpdateRequest);
        log.info("Successfully updated hall with ID: {}", id);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a hall by its unique identifier.
     *
     * @param id the unique identifier of the hall to delete
     * @return a response entity indicating the operation's completion (no content)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHallById(@PathVariable UUID id) {
        log.debug("Entering deleteHallById with ID: {}", id);
        hallService.deleteHallById(id);
        log.info("Successfully deleted hall with ID: {}", id);
        return ResponseEntity.noContent().build();
    }

}

package fr.hoenheimsports.backend.teamservice.controllers;

import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupUpdateRequest;
import fr.hoenheimsports.backend.teamservice.services.AgeGroupService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for managing age group entities.
 * Provides endpoints for retrieving, creating, updating, and deleting age groups.
 */
@RestController
@RequestMapping("api/v1/age-groups")
@Slf4j
public class AgeGroupController {

    /**
     * Service to handle age group business logic.
     */
    private final AgeGroupService ageGroupService;

    /**
     * Constructs a new AgeGroupController with the required service.
     *
     * @param ageGroupService the age group service
     */
    public AgeGroupController(AgeGroupService ageGroupService) {
        this.ageGroupService = ageGroupService;
    }

    /**
     * Retrieves a list of all age groups.
     *
     * @return a response entity containing a list of age group response DTOs
     */
    @GetMapping
    public ResponseEntity<List<AgeGroupResponseDTO>> getAllAgeGroups() {
        log.debug("REST request to get all age groups");
        List<AgeGroupResponseDTO> result = ageGroupService.getAllAgeGroups();
        log.info("Successfully retrieved {} age groups", result.size());
        return ResponseEntity.ok(result);
    }

    /**
     * Creates a new age group.
     *
     * @param ageGroupCreateRequest the DTO containing creation information
     * @return a response entity containing the created age group response DTO
     */
    @PostMapping
    public ResponseEntity<AgeGroupResponseDTO> createAgeGroup(@Valid @RequestBody AgeGroupCreateRequest ageGroupCreateRequest) {
        log.debug("REST request to create age group with payload: {}", ageGroupCreateRequest);
        AgeGroupResponseDTO result = ageGroupService.createAgeGroup(ageGroupCreateRequest);
        log.info("Successfully created age group with ID: {}", result.id());
        return ResponseEntity.ok(result);
    }

    /**
     * Updates an existing age group by its identifier.
     *
     * @param id                    the unique identifier of the age group to update
     * @param ageGroupUpdateRequest the DTO containing updated information
     * @return a response entity containing the updated age group response DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<AgeGroupResponseDTO> updateAgeGroup(@PathVariable UUID id, @Valid @RequestBody AgeGroupUpdateRequest ageGroupUpdateRequest) {
        log.debug("REST request to update age group with ID: {} and payload: {}", id, ageGroupUpdateRequest);
        AgeGroupResponseDTO result = ageGroupService.updateAgeGroup(id, ageGroupUpdateRequest);
        log.info("Successfully updated age group with ID: {}", id);
        return ResponseEntity.ok(result);
    }

    /**
     * Deletes an age group by its identifier.
     *
     * @param id the unique identifier of the age group to delete
     * @return a empty response entity
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgeGroup(@PathVariable UUID id) {
        log.debug("REST request to delete age group with ID: {}", id);
        ageGroupService.deleteAgeGroup(id);
        log.info("Successfully deleted age group with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}

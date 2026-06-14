package fr.hoenheimsports.backend.teamservice.controllers;

import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.TeamUpdateRequest;
import fr.hoenheimsports.backend.teamservice.services.TeamService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for managing teams.
 * Provides endpoints to retrieve, create, update, and delete teams.
 */
@RestController
@RequestMapping("/api/v1/teams")
@Slf4j
public class TeamController {

    /**
     * Service to handle team business logic.
     */
    private final TeamService teamService;

    /**
     * Constructs a new TeamController with the specified team service.
     *
     * @param teamService the team service
     */
    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    /**
     * Retrieves all teams.
     *
     * @return a response entity containing a list of team response DTOs
     */
    @GetMapping
    public ResponseEntity<List<TeamReponseDTO>> getAllStaffs() {
        log.debug("REST request to get all teams");
        List<TeamReponseDTO> result = this.teamService.getAllTeams();
        log.info("Successfully retrieved {} teams", result.size());
        return ResponseEntity.ok(result);
    }

    /**
     * Creates a new team.
     *
     * @param file           an optional multi-part file for the team photo
     * @param teamRequestDTO the team creation payload details
     * @return a response entity containing the created team's response DTO
     */
    @PostMapping
    public ResponseEntity<TeamReponseDTO> createTeam(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("data") @Valid TeamCreateRequest teamRequestDTO
    ) {
        log.debug("REST request to create team with data: {}, hasFile: {}", teamRequestDTO, file != null);
        TeamReponseDTO result = this.teamService.createTeam(file, teamRequestDTO);
        log.info("Successfully created team with ID: {}", result.id());
        return ResponseEntity.ok(result);
    }

    /**
     * Updates an existing team.
     *
     * @param teamId      the unique identifier of the team to update
     * @param file        an optional multi-part file for the new team photo
     * @param teamRequestDTO the team update payload details
     * @return a response entity containing the updated team's response DTO
     */
    @PutMapping("/{teamId}")
    public ResponseEntity<TeamReponseDTO> updateTeam(@PathVariable UUID teamId, @RequestPart(value = "file", required = false) MultipartFile file, @RequestPart("data") @Valid TeamUpdateRequest teamRequestDTO) {
        log.debug("REST request to update team with ID: {} and data: {}, hasFile: {}", teamId, teamRequestDTO, file != null);
        TeamReponseDTO result = this.teamService.updateTeam(teamId, file, teamRequestDTO);
        log.info("Successfully updated team with ID: {}", teamId);
        return ResponseEntity.ok(result);
    }

    /**
     * Deletes a team.
     *
     * @param teamId the unique identifier of the team to delete
     * @return an empty response entity
     */
    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable UUID teamId) {
        log.debug("REST request to delete team with ID: {}", teamId);
        this.teamService.deleteTeam(teamId);
        log.info("Successfully deleted team with ID: {}", teamId);
        return ResponseEntity.noContent().build();
    }
}

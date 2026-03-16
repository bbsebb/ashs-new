package fr.hoenheimsports.backend.teamservice.controllers;

import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamUpdateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.services.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<List<TeamReponseDTO>> getAllStaffs() {
        return ResponseEntity.ok(this.teamService.getAllTeams());
    }

    @PostMapping
    public ResponseEntity<TeamReponseDTO> createTeam(@RequestBody @Valid TeamCreateRequest teamRequestDTO) {
        return ResponseEntity.ok(this.teamService.createTeam(teamRequestDTO));
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<TeamReponseDTO> updateTeam(@PathVariable UUID teamId, @RequestBody @Valid TeamUpdateRequest teamRequestDTO) {
        return ResponseEntity.ok(this.teamService.updateTeam(teamId, teamRequestDTO));
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable UUID teamId) {
        this.teamService.deleteTeam(teamId);
        return ResponseEntity.noContent().build();
    }
}

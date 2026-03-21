package fr.hoenheimsports.backend.teamservice.controllers;

import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.TeamUpdateRequest;
import fr.hoenheimsports.backend.teamservice.services.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<TeamReponseDTO> createTeam(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("data") @Valid TeamCreateRequest teamRequestDTO
    ) {
        return ResponseEntity.ok(this.teamService.createTeam(file, teamRequestDTO));
    }

    @PutMapping("/{teamId}")
    public ResponseEntity<TeamReponseDTO> updateTeam(@PathVariable UUID teamId, @RequestPart(value = "file", required = false) MultipartFile file, @RequestPart("data") @Valid TeamUpdateRequest teamRequestDTO) {
        return ResponseEntity.ok(this.teamService.updateTeam(teamId, file, teamRequestDTO));
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable UUID teamId) {
        this.teamService.deleteTeam(teamId);
        return ResponseEntity.noContent().build();
    }
}

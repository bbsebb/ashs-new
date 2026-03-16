package fr.hoenheimsports.backend.teamservice.controllers;

import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupUpdateRequest;
import fr.hoenheimsports.backend.teamservice.services.AgeGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/age-groups")
@RequiredArgsConstructor
public class AgeGroupController {
    private final AgeGroupService ageGroupService;

    @GetMapping
    public ResponseEntity<List<AgeGroupResponseDTO>> getAllAgeGroups() {
        return ResponseEntity.ok(ageGroupService.getAllAgeGroups());
    }

    @PostMapping
    public ResponseEntity<AgeGroupResponseDTO> createAgeGroup(@RequestBody AgeGroupCreateRequest ageGroupCreateRequest) {
        return ResponseEntity.ok(ageGroupService.createAgeGroup(ageGroupCreateRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgeGroupResponseDTO> updateAgeGroup(@PathVariable UUID id, @RequestBody AgeGroupUpdateRequest ageGroupUpdateRequest) {
        return ResponseEntity.ok(ageGroupService.updateAgeGroup(id, ageGroupUpdateRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgeGroup(@PathVariable UUID id) {
        ageGroupService.deleteAgeGroup(id);
        return ResponseEntity.noContent().build();
    }
}

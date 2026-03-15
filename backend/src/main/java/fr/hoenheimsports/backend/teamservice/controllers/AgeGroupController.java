package fr.hoenheimsports.backend.teamservice.controllers;

import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupeCreateRequest;
import fr.hoenheimsports.backend.teamservice.services.AgeGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/age-group")
@RequiredArgsConstructor
public class AgeGroupController {
    private final AgeGroupService ageGroupService;

    @GetMapping
    public ResponseEntity<List<AgeGroupResponseDTO>> getAllAgeGroups() {
        return ResponseEntity.ok(ageGroupService.getAllAgeGroups());
    }

    @PostMapping
    public ResponseEntity<AgeGroupResponseDTO> createAgeGroup(@RequestBody AgeGroupeCreateRequest ageGroupeCreateRequest) {
        return ResponseEntity.ok(ageGroupService.createAgeGroup(ageGroupeCreateRequest));
    }

}

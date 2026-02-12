package fr.hoenheimsports.backend.seasonservice.controllers;

import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonEditRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import fr.hoenheimsports.backend.seasonservice.services.SeasonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seasons")
@RequiredArgsConstructor
public class SeasonController {
    private final SeasonService seasonService;

    @GetMapping
    public ResponseEntity<List<SeasonResponse>> getAllSeasons() {
        return ResponseEntity.ok(seasonService.getAllSeasons());
    }

    @PostMapping
    public ResponseEntity<SeasonResponse> createSeason(@RequestBody @Valid SeasonCreateRequest seasonCreateRequest) {
        return ResponseEntity.ok(seasonService.createSeason(seasonCreateRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeasonResponse> editSeason(@PathVariable UUID id, @RequestBody @Valid SeasonEditRequest seasonEditRequest) {
        return ResponseEntity.ok(seasonService.editSeason(id, seasonEditRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeasonById(@PathVariable UUID id) {
        seasonService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

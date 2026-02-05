package fr.hoenheimsports.backend.hallservice.controllers;

import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.hallservice.dtos.HallEditRequest;
import fr.hoenheimsports.backend.hallservice.services.HallService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/halls")
public class HallController {

    private final HallService hallService;


    @GetMapping
    public ResponseEntity<List<HallResponse>> getAllHalls() {
        log.info("Récupération de tous les gymnases");
        return ResponseEntity.ok(hallService.getAllHalls());
    }

    @PostMapping
    public ResponseEntity<HallResponse> createHall(@RequestBody @Valid HallCreateRequest hallCreateRequest) {
        return ResponseEntity.ok(hallService.createHall(hallCreateRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HallResponse> editHall(@PathVariable UUID id, @RequestBody @Valid HallEditRequest hallEditRequest) {
        return ResponseEntity.ok(hallService.editHall(id, hallEditRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>  deleteHall(@PathVariable UUID id) {
        hallService.deleteHall(id);
        return ResponseEntity.noContent().build();
    }

}

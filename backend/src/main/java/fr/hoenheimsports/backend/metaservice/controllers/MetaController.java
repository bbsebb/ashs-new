package fr.hoenheimsports.backend.metaservice.controllers;

import fr.hoenheimsports.backend.metaservice.dto.GraphApiResponse;
import fr.hoenheimsports.backend.metaservice.services.MetaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/meta")
@RequiredArgsConstructor
public class MetaController {

    private final MetaService metaService;

    @GetMapping("feeds")
    public ResponseEntity<GraphApiResponse> getFeeds(){
        return ResponseEntity.ok(metaService.getFeeds());
    }
}

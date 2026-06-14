package fr.hoenheimsports.backend.metaservice.controllers;

import fr.hoenheimsports.backend.metaservice.dtos.GraphApiResponse;
import fr.hoenheimsports.backend.metaservice.services.MetaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for retrieving Meta (Facebook/Instagram) feed data.
 */
@RestController
@RequestMapping("/api/v1/meta")
@RequiredArgsConstructor
@Slf4j
public class MetaController {

    private final MetaService metaService;

    /**
     * Retrieves the social media feed from the Meta API.
     *
     * @return a ResponseEntity containing the Graph API response with feed data
     */
    @GetMapping("feeds")
    public ResponseEntity<GraphApiResponse> getFeeds(){
        log.debug("Request received to retrieve Meta social media feeds");
        GraphApiResponse feeds = metaService.getFeeds();
        log.info("Successfully retrieved Meta feeds");
        return ResponseEntity.ok(feeds);
    }
}

package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.services.CampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller exposing public endpoints for campaigns.
 * These endpoints do not require authentication.
 */
@RestController
@RequestMapping("/api/public/campaigns")
@RequiredArgsConstructor
public class PublicCampaignController {
    private final CampaignService campaignService;

    /**
     * Retrieves the single active campaign at status LAUNCHED.
     *
     * @return the active campaign, or 204 No Content if none is active
     */
    @GetMapping("/active")
    public ResponseEntity<CampaignResponse> getActiveCampaign() {
        return campaignService.getActiveCampaign()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}

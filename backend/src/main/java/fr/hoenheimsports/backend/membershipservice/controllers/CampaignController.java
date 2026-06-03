package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.services.CampaignService;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
public class CampaignController {
    private final CampaignService campaignService;
    private final MembershipService membershipService;

    @PostMapping()
    public ResponseEntity<CampaignResponse> createCampaign(@RequestBody @Valid CampaignCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campaignService.createCampaign(request));
    }

    @GetMapping()
    public ResponseEntity<List<CampaignResponse>> getCampaigns() {
        return ResponseEntity.ok(campaignService.getCampaigns());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampaignResponse> updateCampaign(@PathVariable UUID id, @RequestBody @Valid CampaignUpdateRequest request) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable UUID id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/launch")
    public ResponseEntity<Void> launchCampaign(@PathVariable UUID id) {
        campaignService.launchCampaign(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Void> closeCampaign(@PathVariable UUID id) {
        campaignService.closeCampaign(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/memberships")
    public ResponseEntity<List<MembershipResponse>> getMembershipsByCampaign(@PathVariable UUID id) {
        return ResponseEntity.ok(membershipService.getMembershipsByCampaign(id));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<PaymentResponse>> getPaymentTransactionsByCampaign(@PathVariable UUID id) {
        return ResponseEntity.ok(membershipService.getPaymentTransactionsByCampaign(id));
    }
}

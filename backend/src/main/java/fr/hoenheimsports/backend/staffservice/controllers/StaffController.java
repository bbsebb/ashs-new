package fr.hoenheimsports.backend.staffservice.controllers;

import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.services.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/staffs")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<List<StaffResponseDto>> getAllStaffs() {
        return ResponseEntity.ok(this.staffService.getAllStaff());
    }

    @PostMapping
    public ResponseEntity<StaffResponseDto> createStaff(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("data") @Valid StaffCreateRequest staffCreateRequest) {
        return ResponseEntity.ok(this.staffService.createStaff(file, staffCreateRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResponseDto> updateStaff(@PathVariable UUID id,
                                                        @RequestPart(value = "file", required = false) MultipartFile file,
                                                        @RequestPart("data") @Valid StaffUpdateRequest staffUpdateRequest) {
        
        return ResponseEntity.ok(this.staffService.updateStaff(id, file, staffUpdateRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID id) {
        this.staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}

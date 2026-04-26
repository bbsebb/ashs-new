package fr.hoenheimsports.backend.staffservice.controllers;

import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.services.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing staff-related operations.
 */
@RestController
@RequestMapping("/api/v1/staffs")
@RequiredArgsConstructor
public class StaffController {
    private final StaffService staffService;

    /**
     * Retrieves all staff members.
     *
     * @return a ResponseEntity containing the list of all staff members
     */
    @GetMapping
    public ResponseEntity<List<StaffResponseDto>> getAllStaff() {
        return ResponseEntity.ok(this.staffService.getAllStaff());
    }

    /**
     * Creates a new staff member with an optional avatar image.
     *
     * @param file               the optional avatar image file
     * @param staffCreateRequest the details of the staff member to create
     * @return a ResponseEntity containing the created staff member's DTO
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StaffResponseDto> createStaff(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("staff") @Valid StaffCreateRequest staffCreateRequest) {
        return ResponseEntity.ok(this.staffService.createStaff(file, staffCreateRequest));
    }

    /**
     * Updates an existing staff member's details and avatar.
     *
     * @param id                 the unique identifier of the staff member to update
     * @param file               the optional new avatar image file
     * @param staffUpdateRequest the updated details
     * @return a ResponseEntity containing the updated staff member's DTO
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StaffResponseDto> updateStaff(
            @PathVariable UUID id,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("staff") @Valid StaffUpdateRequest staffUpdateRequest) {
        return ResponseEntity.ok(this.staffService.updateStaff(id, file, staffUpdateRequest));
    }

    /**
     * Deletes a staff member by their unique identifier.
     *
     * @param id the unique identifier of the staff member to delete
     * @return a ResponseEntity with no content upon successful deletion
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID id) {
        this.staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}

package fr.hoenheimsports.backend.staffservice.controllers;

import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.services.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class StaffController {
    private final StaffService staffService;

    /**
     * Retrieves all staff members.
     *
     * @return a ResponseEntity containing the list of all staff members
     */
    @GetMapping
    public ResponseEntity<List<StaffResponseDto>> getAllStaff() {
        log.debug("Request received to retrieve all staff members");
        List<StaffResponseDto> staffList = this.staffService.getAllStaff();
        log.info("Successfully retrieved {} staff members", staffList.size());
        return ResponseEntity.ok(staffList);
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
        log.debug("Request received to create a staff member with request details: {}, avatar file present: {}",
                staffCreateRequest, file != null && !file.isEmpty());
        StaffResponseDto createdStaff = this.staffService.createStaff(file, staffCreateRequest);
        log.info("Successfully created staff member with ID: {}", createdStaff.id());
        return ResponseEntity.ok(createdStaff);
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
        log.debug("Request received to update staff member with ID: {}, update details: {}, avatar file present: {}",
                id, staffUpdateRequest, file != null && !file.isEmpty());
        StaffResponseDto updatedStaff = this.staffService.updateStaff(id, file, staffUpdateRequest);
        log.info("Successfully updated staff member with ID: {}", updatedStaff.id());
        return ResponseEntity.ok(updatedStaff);
    }

    /**
     * Deletes a staff member by their unique identifier.
     *
     * @param id the unique identifier of the staff member to delete
     * @return a ResponseEntity with no content upon successful deletion
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID id) {
        log.debug("Request received to delete staff member with ID: {}", id);
        this.staffService.deleteStaff(id);
        log.info("Successfully deleted staff member with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}

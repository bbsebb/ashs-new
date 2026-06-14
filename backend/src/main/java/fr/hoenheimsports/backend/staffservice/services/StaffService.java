package fr.hoenheimsports.backend.staffservice.services;

import fr.hoenheimsports.backend.imagestorage.ImageStorageService;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.staffservice.StaffDeletedEvent;
import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.entities.Email;
import fr.hoenheimsports.backend.staffservice.entities.Phone;
import fr.hoenheimsports.backend.staffservice.mappers.StaffMapper;
import fr.hoenheimsports.backend.staffservice.repositories.StaffRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service managing staff members.
 * Handles CRUD operations, image storage associations, and event publication.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StaffService {

    private final StaffRepository staffRepository;
    private final StaffMapper staffMapper;
    private final ImageStorageService imageStorageService;
    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * Retrieves all staff members.
     *
     * @return a list of staff response DTOs
     */
    public List<StaffResponseDto> getAllStaff() {
        log.debug("Entering getAllStaff to fetch all staff members");
        List<StaffResponseDto> staffList = this.staffRepository.findAll().stream().map(staffMapper::toDto).collect(Collectors.toList());
        log.info("Successfully fetched {} staff members", staffList.size());
        return staffList;
    }

    /**
     * Creates a new staff member and optionally saves their avatar.
     *
     * @param file               the optional avatar image file
     * @param staffCreateRequest the data to create the staff member
     * @return the created staff member's DTO
     */
    public StaffResponseDto createStaff(@Nullable MultipartFile file, StaffCreateRequest staffCreateRequest) {
        log.debug("Entering createStaff with request: {}, file present: {}", staffCreateRequest, file != null && !file.isEmpty());
        var staff = this.staffMapper.toEntity(staffCreateRequest);
        if (file != null) {
            String savedFilename = imageStorageService.saveImage(file);
            log.debug("Saved avatar file with name: {}", savedFilename);
            staff.setAvatarFileName(savedFilename);
        }
        StaffResponseDto createdDto = this.staffMapper.toDto(this.staffRepository.save(staff));
        log.info("Successfully created staff member with ID: {}", createdDto.id());
        return createdDto;
    }

    /**
     * Updates an existing staff member's details and avatar.
     *
     * @param id the unique identifier of the staff member
     * @param file the optional new avatar image file
     * @param staffUpdateRequest the updated data
     * @return the updated staff member's DTO
     * @throws EntityNotFoundException if the staff member does not exist
     */
    public StaffResponseDto updateStaff(UUID id, @Nullable MultipartFile file, StaffUpdateRequest staffUpdateRequest) {
        log.debug("Entering updateStaff for ID: {}, update request: {}, file present: {}", id, staffUpdateRequest, file != null && !file.isEmpty());
        var staff = this.staffRepository.findById(id).orElseThrow(() -> {
            log.error("Staff member with ID {} not found during update operation", id);
            return new EntityNotFoundException("L'encadrant n'a pas été trouvé ou n'existe plus.");
        });
        staff.setEmail(new Email(staffUpdateRequest.email()));
        staff.setPhone(new Phone(staffUpdateRequest.phone()));
        staff.setFirstName(staffUpdateRequest.firstName());
        staff.setLastName(staffUpdateRequest.lastName());
        
        updateAvatarFileName(staff, staffUpdateRequest.avatarFileName(), file);

        StaffResponseDto updatedDto = this.staffMapper.toDto(this.staffRepository.save(staff));
        log.info("Successfully updated staff member with ID: {}", updatedDto.id());
        return updatedDto;
    }

    /**
     * Updates the avatar file name for the given staff member.
     * Deletes the old avatar file if it has changed, and saves the new file if provided.
     *
     * @param staff                   the staff member entity to update
     * @param requestedAvatarFileName the new avatar filename requested
     * @param file                    the optional new avatar image file
     */
    private void updateAvatarFileName(
            fr.hoenheimsports.backend.staffservice.entities.Staff staff,
            @Nullable String requestedAvatarFileName,
            @Nullable MultipartFile file
    ) {
        log.debug("Updating avatar for staff ID: {}, old avatar: {}, requested avatar: {}, file present: {}",
                staff.getId(), staff.getAvatarFileName(), requestedAvatarFileName, file != null && !file.isEmpty());
        if (staff.getAvatarFileName() != null && !staff.getAvatarFileName().equals(requestedAvatarFileName)) {
            log.debug("Deleting old avatar: {}", staff.getAvatarFileName());
            imageStorageService.deleteImage(staff.getAvatarFileName());
            staff.setAvatarFileName(requestedAvatarFileName);
        }

        if (file != null) {
            String newFilename = imageStorageService.saveImage(file);
            log.debug("Saved new avatar: {}", newFilename);
            staff.setAvatarFileName(newFilename);
        }
    }

    /**
     * Deletes a staff member by ID, removes their avatar, and publishes a deletion event.
     *
     * @param id the unique identifier of the staff member to delete
     * @throws EntityNotFoundException if the staff member does not exist
     */
    @Transactional
    public void deleteStaff(UUID id) {
        log.debug("Entering deleteStaff for ID: {}", id);
        var staff = this.staffRepository.findById(id).orElseThrow(() -> {
            log.error("Staff member with ID {} not found during delete operation", id);
            return new EntityNotFoundException("L'encadrant n'a pas été trouvé ou n'existe plus.");
        });
        if (staff.getAvatarFileName() != null) {
            log.debug("Deleting avatar: {} for staff ID: {}", staff.getAvatarFileName(), id);
            imageStorageService.deleteImage(staff.getAvatarFileName());
        }
        this.staffRepository.delete(staff);
        log.info("Successfully deleted staff member from repository, publishing StaffDeletedEvent for ID: {}", id);
        applicationEventPublisher.publishEvent(new StaffDeletedEvent(staff.getId()));
    }
}

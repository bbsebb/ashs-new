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
        return this.staffRepository.findAll().stream().map(staffMapper::toDto).collect(Collectors.toList());
    }

    /**
     * Creates a new staff member and optionally saves their avatar.
     *
     * @param file               the optional avatar image file
     * @param staffCreateRequest the data to create the staff member
     * @return the created staff member's DTO
     */
    public StaffResponseDto createStaff(@Nullable MultipartFile file, StaffCreateRequest staffCreateRequest) {

        var staff = this.staffMapper.toEntity(staffCreateRequest);
        if (file != null) {
            staff.setAvatarFileName(imageStorageService.saveImage(file));
        }
        return this.staffMapper.toDto(this.staffRepository.save(staff));
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
        var staff = this.staffRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("L'encadrant n'a pas été trouvé ou n'existe plus."));
        staff.setEmail(new Email(staffUpdateRequest.email()));
        staff.setPhone(new Phone(staffUpdateRequest.phone()));
        staff.setFirstName(staffUpdateRequest.firstName());
        staff.setLastName(staffUpdateRequest.lastName());
        
        updateAvatarFileName(staff, staffUpdateRequest.avatarFileName(), file);

        return this.staffMapper.toDto(this.staffRepository.save(staff));
    }

    private void updateAvatarFileName(
            fr.hoenheimsports.backend.staffservice.entities.Staff staff,
            @Nullable String requestedAvatarFileName,
            @Nullable MultipartFile file
    ) {
        if (staff.getAvatarFileName() != null && !staff.getAvatarFileName().equals(requestedAvatarFileName)) {
            imageStorageService.deleteImage(staff.getAvatarFileName());
            staff.setAvatarFileName(requestedAvatarFileName);
        }

        if (file != null) {
            staff.setAvatarFileName(imageStorageService.saveImage(file));
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
        var staff = this.staffRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("L'encadrant n'a pas été trouvé ou n'existe plus."));
        if (staff.getAvatarFileName() != null) {
            imageStorageService.deleteImage(staff.getAvatarFileName());
        }
        this.staffRepository.delete(staff);
        applicationEventPublisher.publishEvent(new StaffDeletedEvent(staff.getId()));
    }
}

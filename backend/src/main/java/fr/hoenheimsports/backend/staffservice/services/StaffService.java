package fr.hoenheimsports.backend.staffservice.services;

import fr.hoenheimsports.backend.imagestorage.ImageStorageService;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.entities.Email;
import fr.hoenheimsports.backend.staffservice.entities.Phone;
import fr.hoenheimsports.backend.staffservice.mappers.StaffMapper;
import fr.hoenheimsports.backend.staffservice.repositories.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final StaffMapper staffMapper;
    private final ImageStorageService imageStorageService;

    public List<StaffResponseDto> getAllStaff() {
        return this.staffRepository.findAll().stream().map(staffMapper::toDto).collect(Collectors.toList());
    }

    public StaffResponseDto createStaff(@Nullable MultipartFile file, StaffCreateRequest staffCreateRequest) {

        var staff = this.staffMapper.toEntity(staffCreateRequest);
        if (file != null) {
            staff.setAvatarFileName(imageStorageService.saveImage(file));
        }
        return this.staffMapper.toDto(this.staffRepository.save(staff));
    }

    public StaffResponseDto updateStaff(UUID id, @Nullable MultipartFile file, StaffUpdateRequest staffUpdateRequest) {
        var staff = this.staffRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("L'encadrant n'a pas été trouvé ou n'existe plus."));
        staff.setEmail(new Email(staffUpdateRequest.email()));
        staff.setPhone(new Phone(staffUpdateRequest.phone()));
        staff.setFirstName(staffUpdateRequest.firstName());
        staff.setLastName(staffUpdateRequest.lastName());
        // if there is a new filename, file is not null. If the avatar is deleted, avatarFileName is null
        updateAvatarFileName(staff, staffUpdateRequest.avatarFileName(), file);

        return this.staffMapper.toDto(this.staffRepository.save(staff));
    }

    private void updateAvatarFileName(
            fr.hoenheimsports.backend.staffservice.entities.Staff staff,
            @Nullable String requestedAvatarFileName,
            @Nullable MultipartFile file
    ) {
        // If there is a new filename, file is not null. If the avatar is deleted, avatarFileName is null
        if (staff.getAvatarFileName() != null && !staff.getAvatarFileName().equals(requestedAvatarFileName)) {
            imageStorageService.deleteImage(staff.getAvatarFileName());
            staff.setAvatarFileName(requestedAvatarFileName);
        }

        if (file != null) {
            staff.setAvatarFileName(imageStorageService.saveImage(file));
        }
    }

    public void deleteStaff(UUID id) {
        var staff = this.staffRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("L'encadrant n'a pas été trouvé ou n'existe plus."));
        if (staff.getAvatarFileName() != null) {
            imageStorageService.deleteImage(staff.getAvatarFileName());
        }
        this.staffRepository.delete(staff);
    }
}

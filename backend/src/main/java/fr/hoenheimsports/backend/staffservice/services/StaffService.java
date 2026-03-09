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

    public StaffResponseDto createStaff(MultipartFile file, StaffCreateRequest staffCreateRequest) {

        var staff = this.staffMapper.toEntity(staffCreateRequest);
        if (file != null) {
            staff.setFileName(imageStorageService.saveImage(file));
        }
        return this.staffMapper.toDto(this.staffRepository.save(staff));
    }

    public StaffResponseDto updateStaff(UUID id, MultipartFile file, StaffUpdateRequest staffUpdateRequest) {
        var staff = this.staffRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Le Staff n'a pas été trouvée ou n'existe plus."));
        staff.setEmail(new Email(staffUpdateRequest.email()));
        staff.setPhone(new Phone(staffUpdateRequest.phone()));
        staff.setFirstName(staffUpdateRequest.firstName());
        staff.setLastName(staffUpdateRequest.lastName());
        // if there is a new filename, file is not null. If the avatar is deleted, fileName is null
        staff.setFileName(staffUpdateRequest.fileName());
        if (file != null) {
            staff.setFileName(imageStorageService.saveImage(file));
        }

        return this.staffMapper.toDto(this.staffRepository.save(staff));
    }

    public void deleteStaff(UUID id) {
        var coach = this.staffRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Le Staff n'a pas été trouvée ou n'existe plus."));
        this.staffRepository.delete(coach);
    }
}

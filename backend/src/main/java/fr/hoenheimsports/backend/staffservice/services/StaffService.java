package fr.hoenheimsports.backend.staffservice.services;

import fr.hoenheimsports.backend.staffservice.dtos.StaffRequestDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.entities.Email;
import fr.hoenheimsports.backend.staffservice.entities.Phone;
import fr.hoenheimsports.backend.staffservice.mappers.StaffMapper;
import fr.hoenheimsports.backend.staffservice.repositories.StaffRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final StaffMapper staffMapper;

    public List<StaffResponseDto> getAllStaff() {
        return this.staffRepository.findAll().stream().map(staffMapper::toDto).collect(Collectors.toList());
    }

    public StaffResponseDto createStaff(StaffRequestDto staffRequestDto) {
        return this.staffMapper.toDto(this.staffRepository.save(this.staffMapper.toEntity(staffRequestDto)));
    }

    public StaffResponseDto updateStaff(UUID id, StaffRequestDto staffRequestDto) {
        var coach = this.staffRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Le Staff n'a pas été trouvée ou n'existe plus."));
        coach.setEmail(new Email(staffRequestDto.email()));
        coach.setPhone(new Phone(staffRequestDto.phone()));
        coach.setFirstName(staffRequestDto.firstName());
        coach.setLastName(staffRequestDto.lastName());
        return this.staffMapper.toDto(this.staffRepository.save(coach));
    }

    public void deleteStaff(UUID id) {
        var coach = this.staffRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Le Staff n'a pas été trouvée ou n'existe plus."));
        this.staffRepository.delete(coach);
    }
}

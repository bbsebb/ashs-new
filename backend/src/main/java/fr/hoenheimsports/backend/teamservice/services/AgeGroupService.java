package fr.hoenheimsports.backend.teamservice.services;

import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupUpdateRequest;
import fr.hoenheimsports.backend.teamservice.mappers.AgeGroupMapper;
import fr.hoenheimsports.backend.teamservice.repository.AgeGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgeGroupService {
    private final AgeGroupRepository ageGroupRepository;
    private final AgeGroupMapper ageGroupMapper;


    public List<AgeGroupResponseDTO> getAllAgeGroups() {
        return ageGroupRepository.findAll().stream()
                .map(ageGroupMapper::toDto)
                .toList();
    }


    public AgeGroupResponseDTO createAgeGroup(AgeGroupCreateRequest ageGroupCreateRequest) {
        return ageGroupMapper.toDto(ageGroupRepository.save(ageGroupMapper.toEntity(ageGroupCreateRequest)));
    }

    public AgeGroupResponseDTO updateAgeGroup(UUID id, AgeGroupUpdateRequest ageGroupUpdateRequest) {
        var ageGroup = this.ageGroupRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("La catégorie d'age n'a pas été trouvée ou n'existe plus."));
        ageGroup.setAgeLimit(ageGroupUpdateRequest.ageLimit());
        ageGroup.setUpperLimit(ageGroupUpdateRequest.upperLimit());
        return this.ageGroupMapper.toDto(ageGroup);
    }

    public void deleteAgeGroup(UUID id) {
        var ageGroup = this.ageGroupRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("La catégorie d'age n'a pas été trouvée ou n'existe plus."));
        this.ageGroupRepository.delete(ageGroup);
    }
}

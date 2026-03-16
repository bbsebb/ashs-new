package fr.hoenheimsports.backend.teamservice.services;

import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupeCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupeEditRequest;
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


    public AgeGroupResponseDTO createAgeGroup(AgeGroupeCreateRequest ageGroupeCreateRequest) {
        return ageGroupMapper.toDto(ageGroupRepository.save(ageGroupMapper.toEntity(ageGroupeCreateRequest)));
    }

    public AgeGroupResponseDTO editAgeGroup(UUID id, AgeGroupeEditRequest ageGroupeEditRequest) {
        var ageGroup = this.ageGroupRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("La catégorie d'age n'a pas été trouvée ou n'existe plus."));
        ageGroup.setAgeLimit(ageGroupeEditRequest.ageLimit());
        ageGroup.setUpperLimit(ageGroupeEditRequest.upperLimit());
        return this.ageGroupMapper.toDto(ageGroup);
    }

    public void deleteAgeGroup(UUID id) {
        var ageGroup = this.ageGroupRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("La catégorie d'age n'a pas été trouvée ou n'existe plus."));
        this.ageGroupRepository.delete(ageGroup);
    }
}

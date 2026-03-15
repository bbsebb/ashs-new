package fr.hoenheimsports.backend.teamservice.services;

import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupeCreateRequest;
import fr.hoenheimsports.backend.teamservice.mappers.AgeGroupMapper;
import fr.hoenheimsports.backend.teamservice.repository.AgeGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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
}

package fr.hoenheimsports.backend.teamservice.services;

import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupUpdateRequest;
import fr.hoenheimsports.backend.teamservice.mappers.AgeGroupMapper;
import fr.hoenheimsports.backend.teamservice.repository.AgeGroupRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service class for managing age groups.
 * Provides transactional methods for retrieving, creating, updating, and deleting age groups.
 */
@Service
@Slf4j
public class AgeGroupService {

    /**
     * Repository for performing database operations on age groups.
     */
    private final AgeGroupRepository ageGroupRepository;

    /**
     * Mapper to convert between age group entities and their corresponding DTOs.
     */
    private final AgeGroupMapper ageGroupMapper;

    /**
     * Constructs a new AgeGroupService with the specified repository and mapper.
     *
     * @param ageGroupRepository the age group repository
     * @param ageGroupMapper     the age group mapper
     */
    public AgeGroupService(AgeGroupRepository ageGroupRepository, AgeGroupMapper ageGroupMapper) {
        this.ageGroupRepository = ageGroupRepository;
        this.ageGroupMapper = ageGroupMapper;
    }

    /**
     * Retrieves all age groups, sorted, and mapped to response DTOs.
     *
     * @return a list of age group response DTOs
     */
    public List<AgeGroupResponseDTO> getAllAgeGroups() {
        log.debug("Entering getAllAgeGroups");
        List<AgeGroupResponseDTO> ageGroups = ageGroupRepository.findAll().stream()
                .sorted()
                .map(ageGroupMapper::toDto)
                .toList();
        log.info("Found {} age groups", ageGroups.size());
        return ageGroups;
    }

    /**
     * Creates a new age group from the provided request.
     *
     * @param ageGroupCreateRequest the age group creation request containing limits details
     * @return the created age group response DTO
     */
    public AgeGroupResponseDTO createAgeGroup(AgeGroupCreateRequest ageGroupCreateRequest) {
        log.debug("Entering createAgeGroup with request: {}", ageGroupCreateRequest);
        AgeGroupResponseDTO result = ageGroupMapper.toDto(ageGroupRepository.save(ageGroupMapper.toEntity(ageGroupCreateRequest)));
        log.info("Successfully created age group with ID: {}", result.id());
        return result;
    }

    /**
     * Updates an existing age group.
     *
     * @param id                    the UUID of the age group to update
     * @param ageGroupUpdateRequest the update details
     * @return the updated age group response DTO
     * @throws EntityNotFoundException if the age group does not exist
     */
    public AgeGroupResponseDTO updateAgeGroup(UUID id, AgeGroupUpdateRequest ageGroupUpdateRequest) {
        log.debug("Entering updateAgeGroup with ID: {} and request: {}", id, ageGroupUpdateRequest);
        var ageGroup = this.ageGroupRepository.findById(id).orElseThrow(() -> {
            log.error("Age group with ID {} not found for update", id);
            return new EntityNotFoundException("La catégorie d'age n'a pas été trouvée ou n'existe plus.");
        });
        ageGroup.setAgeLimit(ageGroupUpdateRequest.ageLimit());
        ageGroup.setUpperLimit(ageGroupUpdateRequest.upperLimit());
        // Note: JPA dirty checking (or caller transactional context) updates database
        AgeGroupResponseDTO dto = this.ageGroupMapper.toDto(ageGroup);
        log.info("Successfully updated age group with ID: {}", id);
        return dto;
    }

    /**
     * Deletes an age group by its identifier.
     *
     * @param id the UUID of the age group to delete
     * @throws EntityNotFoundException if the age group does not exist
     */
    public void deleteAgeGroup(UUID id) {
        log.debug("Entering deleteAgeGroup with ID: {}", id);
        var ageGroup = this.ageGroupRepository.findById(id).orElseThrow(() -> {
            log.error("Age group with ID {} not found for deletion", id);
            return new EntityNotFoundException("La catégorie d'age n'a pas été trouvée ou n'existe plus.");
        });
        this.ageGroupRepository.delete(ageGroup);
        log.info("Successfully deleted age group with ID: {}", id);
    }
}

package fr.hoenheimsports.backend.hallservice.services;

import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.hallservice.dtos.HallUpdateRequest;
import fr.hoenheimsports.backend.hallservice.entities.Hall;
import fr.hoenheimsports.backend.hallservice.mappers.HallMapper;
import fr.hoenheimsports.backend.hallservice.repositories.HallRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service managing sports hall operations.
 * Provides functionality for listing, creating, updating, and deleting halls.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HallService {
    /**
     * Repository for performing database operations on halls.
     */
    private final HallRepository hallRepository;

    /**
     * Mapper for converting between Hall entities and DTOs.
     */
    private final HallMapper hallMapper;

    /**
     * Retrieves all sports halls.
     *
     * @return a list of all halls as response DTOs
     */
    public List<HallResponse> getAllHalls() {
        log.debug("Appel de getAllHalls");
        var halls = hallRepository.findAll().stream().map(hallMapper::toDto).toList();
        log.debug("Retour de getAllHalls - Nombre de salles : {}", halls.size());
        return halls;
    }

    /**
     * Creates and persists a new sports hall.
     *
     * @param hallCreateRequest the data to create the hall
     * @return the created hall's DTO
     */
    public HallResponse createHall(HallCreateRequest hallCreateRequest) {
        log.debug("Tentative de création d'une salle avec le nom: {}", hallCreateRequest.name());
        HallResponse response = hallMapper.toDto(hallRepository.save(hallMapper.toEntity(hallCreateRequest)));
        log.info("Salle créée avec succès : ID {}", response.id());
        return response;
    }

    /**
     * Updates an existing sports hall's details.
     *
     * @param id                the unique identifier of the hall to update
     * @param hallUpdateRequest the updated data
     * @return the updated hall's DTO
     * @throws EntityNotFoundException if the hall does not exist
     */
    public HallResponse updateHall(UUID id, HallUpdateRequest hallUpdateRequest) {
        log.debug("Tentative de mise à jour de la salle avec le nom: {}", hallUpdateRequest.name());
        Hall hall = hallRepository.findById(id).orElseThrow(() -> {
            log.error("Hall with ID {} not found for update", id);
            return new EntityNotFoundException("La salle avec le nom -" + hallUpdateRequest.name() + "- n'a pas été trouvé ou n'existe plus.");
        });
        hall.setName(hallUpdateRequest.name());
        hall.getAddress().setStreet(hallUpdateRequest.addressStreet());
        hall.getAddress().setCity(hallUpdateRequest.addressCity());
        hall.getAddress().setPostalCode(hallUpdateRequest.addressPostalCode());
        hall.getAddress().setCountry(hallUpdateRequest.addressCountry());
        log.info("Mise à jour de la salle : {}", id);
        return hallMapper.toDto(hallRepository.save(hall));
    }

    /**
     * Deletes a sports hall by its ID.
     *
     * @param uuid the unique identifier of the hall to delete
     * @throws EntityNotFoundException if the hall does not exist
     */
    public void deleteHallById(UUID uuid) {
        log.debug("Tentative de suppression de la salle avec l'ID : {}", uuid);
        var hall = hallRepository.findById(uuid).orElseThrow(() -> {
            log.error("Hall with ID {} not found for deletion", uuid);
            return new EntityNotFoundException("La salle n'a pas été trouvé ou n'existe plus.");
        });
        hallRepository.delete(hall);
        log.info("Salle supprimée : {}", uuid);

    }


}

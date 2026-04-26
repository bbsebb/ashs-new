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

@Service
@RequiredArgsConstructor
@Slf4j
public class HallService {
    private final HallRepository hallRepository;
    private final HallMapper hallMapper;

/*    public HallResponse getHallById(String id) {
        return hallMapper.toDto(hallRepository.findById(UUID.fromString(id)).orElseThrow(() -> new EntityNotFoundException("Hall not found")));
    }*/

    /**
     * Retrieves all halls and maps to DTO list
     */
    public List<HallResponse> getAllHalls() {
        log.debug("Appel de getAllHalls");
        var halls = hallRepository.findAll().stream().map(hallMapper::toDto).toList();
        log.debug("Retour de getAllHalls - Nombre de salles : {}", halls.size());
        return halls;
    }

    /**
     * Creates and persists hall; returns mapped response
     */
    public HallResponse createHall(HallCreateRequest hallCreateRequest) {
        log.debug("Tentative de création d'une salle avec le nom: {}", hallCreateRequest.name());
        HallResponse response = hallMapper.toDto(hallRepository.save(hallMapper.toEntity(hallCreateRequest)));
        log.info("Salle créée avec succès : ID {}", response.id());
        return response;
    }

    public HallResponse updateHall(UUID id, HallUpdateRequest hallUpdateRequest) {
        log.debug("Tentative de mise à jour de la salle avec le nom: {}", hallUpdateRequest.name());
        Hall hall = hallRepository.findById(id).orElseThrow(() -> new EntityNotFoundException(STR."La salle avec le nom -\{hallUpdateRequest.name()}- n'a pas été trouvé ou n'existe plus."));
        hall.setName(hallUpdateRequest.name());
        hall.getAddress().setStreet(hallUpdateRequest.addressStreet());
        hall.getAddress().setCity(hallUpdateRequest.addressCity());
        hall.getAddress().setPostalCode(hallUpdateRequest.addressPostalCode());
        hall.getAddress().setCountry(hallUpdateRequest.addressCountry());
        log.info("Mise à jour de la salle : {}", id);
        return hallMapper.toDto(hallRepository.save(hall));
    }

    public void deleteHallById(UUID uuid) {
        log.debug("Tentative de suppression de la salle avec l'ID : {}", uuid);
        var hall = hallRepository.findById(uuid).orElseThrow(() -> new EntityNotFoundException("La salle n'a pas été trouvé ou n'existe plus."));
        hallRepository.delete(hall);
        log.info("Salle supprimée : {}", uuid);

    }


}

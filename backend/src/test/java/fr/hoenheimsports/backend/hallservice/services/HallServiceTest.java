package fr.hoenheimsports.backend.hallservice.services;

import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.hallservice.dtos.HallUpdateRequest;
import fr.hoenheimsports.backend.hallservice.entities.Address;
import fr.hoenheimsports.backend.hallservice.entities.Hall;
import fr.hoenheimsports.backend.hallservice.mappers.HallMapper;
import fr.hoenheimsports.backend.hallservice.repositories.HallRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HallServiceTest {

    @Mock
    private HallRepository hallRepository;

    @Mock
    private HallMapper hallMapper;

    @InjectMocks
    private HallService hallService;

    @Test
    void getAllHalls_ShouldReturnListOfHalls() {
        // Arrange
        Hall hall = new Hall();
        HallResponse response = new HallResponse(UUID.randomUUID(), "Gym", "Street", "City", "00000", "Country");
        when(hallRepository.findAll()).thenReturn(List.of(hall));
        when(hallMapper.toDto(hall)).thenReturn(response);

        // Act
        List<HallResponse> result = hallService.getAllHalls();

        // Assert
        assertThat(result).hasSize(1).containsExactly(response);
        verify(hallRepository).findAll();
    }

    @Test
    void createHall_ShouldSucceed() {
        // Arrange
        HallCreateRequest request = new HallCreateRequest("Gym", "Street", "City", "00000", "Country");
        Hall hall = new Hall();
        HallResponse response = new HallResponse(UUID.randomUUID(), "Gym", "Street", "City", "00000", "Country");

        when(hallMapper.toEntity(request)).thenReturn(hall);
        when(hallRepository.save(hall)).thenReturn(hall);
        when(hallMapper.toDto(hall)).thenReturn(response);

        // Act
        HallResponse result = hallService.createHall(request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(hallRepository).save(hall);
    }

    @Test
    void updateHall_ShouldUpdateAndReturnHall() {
        // Arrange
        UUID id = UUID.randomUUID();
        HallUpdateRequest request = new HallUpdateRequest("New Gym", "New Street", "New City", "11111", "New Country");

        Hall existingHall = new Hall();
        existingHall.setAddress(new Address());

        HallResponse response = new HallResponse(id, "New Gym", "New Street", "New City", "11111", "New Country");

        when(hallRepository.findById(id)).thenReturn(Optional.of(existingHall));
        when(hallRepository.save(existingHall)).thenReturn(existingHall);
        when(hallMapper.toDto(existingHall)).thenReturn(response);

        // Act
        HallResponse result = hallService.updateHall(id, request);

        // Assert
        assertThat(result).isEqualTo(response);
        assertThat(existingHall.getName()).isEqualTo("New Gym");
        assertThat(existingHall.getAddress().getStreet()).isEqualTo("New Street");
        verify(hallRepository).save(existingHall);
    }

    @Test
    void updateHall_ShouldThrowException_WhenHallNotFound() {
        // Arrange
        UUID id = UUID.randomUUID();
        HallUpdateRequest request = new HallUpdateRequest("New Gym", "New Street", "New City", "11111", "New Country");

        when(hallRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> hallService.updateHall(id, request))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("n'a pas été trouvé ou n'existe plus");
    }

    @Test
    void deleteHallById_ShouldDelete_WhenHallExists() {
        // Arrange
        UUID id = UUID.randomUUID();
        Hall hall = new Hall();
        when(hallRepository.findById(id)).thenReturn(Optional.of(hall));

        // Act
        hallService.deleteHallById(id);

        // Assert
        verify(hallRepository).delete(hall);
    }

    @Test
    void deleteHallById_ShouldThrowException_WhenHallNotFound() {
        // Arrange
        UUID id = UUID.randomUUID();
        when(hallRepository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> hallService.deleteHallById(id))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("La salle n'a pas été trouvé ou n'existe plus");
    }
}
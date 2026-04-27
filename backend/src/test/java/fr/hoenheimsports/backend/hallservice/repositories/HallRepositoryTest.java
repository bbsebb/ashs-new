package fr.hoenheimsports.backend.hallservice.repositories;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.hallservice.entities.Address;
import fr.hoenheimsports.backend.hallservice.entities.Hall;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class HallRepositoryTest {

    @Autowired
    private HallRepository hallRepository;

    @Nested
    class CRUDOperations {
        @Test
        void shouldSaveAndVerifyAllFields() {
            // Arrange
            Hall hall = new Hall();
            hall.setName("Gymnase des Malteries");
            Address address = new Address();
            address.setStreet("rue des Malteries");
            address.setCity("Schiltigheim");
            address.setPostalCode("67300");
            address.setCountry("France");
            hall.setAddress(address);

            // Act
            Hall saved = hallRepository.saveAndFlush(hall);
            Optional<Hall> found = hallRepository.findById(saved.getId());

            // Assert
            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo(saved.getId());
            assertThat(found.get().getName()).isEqualTo("Gymnase des Malteries");
            assertThat(found.get().getAddress().getStreet()).isEqualTo("rue des Malteries");
            assertThat(found.get().getAddress().getCity()).isEqualTo("Schiltigheim");
            assertThat(found.get().getAddress().getPostalCode()).isEqualTo("67300");
            assertThat(found.get().getAddress().getCountry()).isEqualTo("France");
        }

        @Test
        void shouldUpdateAndVerifyFields() {
            // Arrange
            Hall hall = new Hall();
            hall.setName("Old Name");
            Address address = new Address();
            address.setStreet("S");
            address.setCity("C");
            address.setPostalCode("P");
            address.setCountry("C");
            hall.setAddress(address);
            Hall saved = hallRepository.saveAndFlush(hall);

            // Act
            saved.setName("New Name");
            Hall updated = hallRepository.saveAndFlush(saved);

            // Assert
            assertThat(updated.getName()).isEqualTo("New Name");
        }

        @Test
        void shouldDeleteHall() {
            // Arrange
            Hall hall = new Hall();
            hall.setName("To delete");
            Address address = new Address();
            address.setStreet("S");
            address.setCity("C");
            address.setPostalCode("P");
            address.setCountry("C");
            hall.setAddress(address);
            Hall saved = hallRepository.saveAndFlush(hall);

            // Act
            hallRepository.delete(saved);
            hallRepository.flush();

            // Assert
            assertThat(hallRepository.findById(saved.getId())).isEmpty();
        }
    }
}

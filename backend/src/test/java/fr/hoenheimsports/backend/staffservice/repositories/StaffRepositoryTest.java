package fr.hoenheimsports.backend.staffservice.repositories;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.staffservice.entities.Email;
import fr.hoenheimsports.backend.staffservice.entities.Phone;
import fr.hoenheimsports.backend.staffservice.entities.Staff;
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
class StaffRepositoryTest {

    @Autowired
    private StaffRepository staffRepository;

    @Nested
    class CRUDOperations {
        @Test
        void shouldSaveAndVerifyAllFields() {
            // Arrange
            Staff staff = new Staff();
            staff.setFirstName("John");
            staff.setLastName("Doe");
            staff.setEmail(new Email("john@doe.com"));
            staff.setPhone(new Phone("0123456789"));
            staff.setAvatarFileName("avatar.png");

            // Act
            Staff saved = staffRepository.saveAndFlush(staff);
            Optional<Staff> found = staffRepository.findById(saved.getId());

            // Assert
            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo(saved.getId());
            assertThat(found.get().getFirstName()).isEqualTo("John");
            assertThat(found.get().getLastName()).isEqualTo("Doe");
            assertThat(found.get().getEmail().email()).isEqualTo("john@doe.com");
            assertThat(found.get().getPhone().phone()).isEqualTo("0123456789");
            assertThat(found.get().getAvatarFileName()).isEqualTo("avatar.png");
        }

        @Test
        void shouldUpdateAndVerifyFields() {
            // Arrange
            Staff staff = new Staff();
            staff.setFirstName("Old");
            staff.setLastName("Name");
            Staff saved = staffRepository.saveAndFlush(staff);

            // Act
            saved.setFirstName("New");
            Staff updated = staffRepository.saveAndFlush(saved);

            // Assert
            assertThat(updated.getFirstName()).isEqualTo("New");
        }

        @Test
        void shouldDeleteStaff() {
            // Arrange
            Staff staff = new Staff();
            staff.setFirstName("To");
            staff.setLastName("Delete");
            Staff saved = staffRepository.saveAndFlush(staff);

            // Act
            staffRepository.delete(saved);
            staffRepository.flush();

            // Assert
            assertThat(staffRepository.findById(saved.getId())).isEmpty();
        }
    }
}

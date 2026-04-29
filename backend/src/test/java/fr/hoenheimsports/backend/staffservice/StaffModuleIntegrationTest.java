package fr.hoenheimsports.backend.staffservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.imagestorage.ImageStorageService;
import fr.hoenheimsports.backend.staffservice.entities.Email;
import fr.hoenheimsports.backend.staffservice.entities.Phone;
import fr.hoenheimsports.backend.staffservice.entities.Staff;
import fr.hoenheimsports.backend.staffservice.mappers.StaffMapper;
import fr.hoenheimsports.backend.staffservice.repositories.StaffRepository;
import fr.hoenheimsports.backend.staffservice.services.StaffService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;

@ApplicationModuleTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.modulith.events.jdbc.schema-initialization.enabled=true")
class StaffModuleIntegrationTest {

    @Autowired
    StaffService staffService;

    @Autowired
    StaffRepository staffRepository;

    @MockitoBean
    ImageStorageService imageStorageService;

    @MockitoBean
    StaffMapper staffMapper;

    @Test
    void shouldPublishStaffDeletedEvent(PublishedEvents events) {
        // Given
        Staff staff = new Staff();
        staff.setFirstName("John");
        staff.setLastName("Doe");
        staff.setEmail(new Email("john@doe.com"));
        staff.setPhone(new Phone("0123456789"));
        Staff savedStaff = staffRepository.saveAndFlush(staff);

        // When
        staffService.deleteStaff(savedStaff.getId());

        // Then
        var matchingEvents = events.ofType(StaffDeletedEvent.class);
        assertThat(matchingEvents).hasSize(1);
        assertThat(matchingEvents.iterator().next().id()).isEqualTo(savedStaff.getId());
    }
}

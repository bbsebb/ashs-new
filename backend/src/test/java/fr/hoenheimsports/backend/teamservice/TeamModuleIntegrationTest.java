package fr.hoenheimsports.backend.teamservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.imagestorage.ImageStorageService;
import fr.hoenheimsports.backend.staffservice.StaffDeletedEvent;
import fr.hoenheimsports.backend.teamservice.entities.*;
import fr.hoenheimsports.backend.teamservice.mappers.TeamMapper;
import fr.hoenheimsports.backend.teamservice.repository.AgeGroupRepository;
import fr.hoenheimsports.backend.teamservice.repository.TeamRepository;
import fr.hoenheimsports.backend.teamservice.repository.TeamStaffRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.Scenario;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@ApplicationModuleTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.modulith.events.jdbc.schema-initialization.enabled=true")
class TeamModuleIntegrationTest {

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Autowired
    TeamRepository teamRepository;

    @Autowired
    AgeGroupRepository ageGroupRepository;

    @MockitoBean
    TeamStaffRepository teamStaffRepository;

    @MockitoBean
    ImageStorageService imageStorageService;

    @MockitoBean
    TeamMapper teamMapper;

    @Test
    void shouldHandleStaffDeletedEvent(Scenario scenario) {
        // Given
        UUID staffId = UUID.randomUUID();

        AgeGroup ageGroup = new AgeGroup();
        ageGroup.setAgeLimit(18);
        ageGroup.setUpperLimit(true);
        ageGroup = ageGroupRepository.saveAndFlush(ageGroup);

        Team team = new Team();
        team.setSeasonId(UUID.randomUUID());
        team.setGender(Gender.Male);
        team.setName(new TeamName(1, ageGroup));

        TeamStaff teamStaff = new TeamStaff();
        teamStaff.setStaffId(staffId);
        teamStaff.setRole(Role.COACH);
        team.addStaff(teamStaff);

        teamRepository.saveAndFlush(team);

        assertThat(teamRepository.findDistinctByStaffs_StaffId(staffId)).hasSize(1);

        // When & Then
        scenario.publish(new StaffDeletedEvent(staffId))
                .andWaitForStateChange(() -> teamRepository.findDistinctByStaffs_StaffId(staffId), List::isEmpty)
                .andVerify(teams -> assertThat(teams).isEmpty());
    }
}

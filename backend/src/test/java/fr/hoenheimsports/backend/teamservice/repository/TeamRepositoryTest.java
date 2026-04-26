package fr.hoenheimsports.backend.teamservice.repository;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import fr.hoenheimsports.backend.teamservice.entities.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class TeamRepositoryTest {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void shouldFindAllBySeasonId() {
        // Arrange
        Season season = new Season();
        season.setStartDate(LocalDate.of(2025, 9, 1));
        season.setEndDate(LocalDate.of(2026, 6, 30));
        season.setName("Saison 2025-2026");
        entityManager.persist(season);

        AgeGroup ageGroup = new AgeGroup();
        ageGroup.setAgeLimit(11);
        ageGroup.setUpperLimit(true);
        entityManager.persist(ageGroup);

        Team team = new Team();
        team.setSeasonId(season.getId());
        team.setGender(Gender.Male);
        team.setName(new TeamName(1, ageGroup));
        entityManager.persist(team);
        entityManager.flush();

        // Act
        List<Team> teams = teamRepository.findAllBySeasonId(season.getId());

        // Assert
        assertThat(teams).hasSize(1);
        assertThat(teams.get(0).getSeasonId()).isEqualTo(season.getId());
    }

    @Test
    void shouldFindDistinctByStaffs_StaffId() {
        // Arrange
        Season season = new Season();
        season.setStartDate(LocalDate.of(2025, 9, 1));
        season.setEndDate(LocalDate.of(2026, 6, 30));
        season.setName("Saison 2025-2026");
        entityManager.persist(season);

        AgeGroup ageGroup = new AgeGroup();
        ageGroup.setAgeLimit(18);
        ageGroup.setUpperLimit(true);
        entityManager.persist(ageGroup);

        UUID staffId = UUID.randomUUID();

        Team team = new Team();
        team.setSeasonId(season.getId());
        team.setGender(Gender.Female);
        team.setName(new TeamName(1, ageGroup));

        TeamStaff teamStaff = new TeamStaff();
        teamStaff.setStaffId(staffId);
        teamStaff.setRole(Role.COACH);
        team.addStaff(teamStaff);

        entityManager.persist(team);
        entityManager.flush();

        // Act
        List<Team> teams = teamRepository.findDistinctByStaffs_StaffId(staffId);

        // Assert
        assertThat(teams).hasSize(1);
        assertThat(teams.get(0).getStaffs()).anyMatch(s -> s.getStaffId().equals(staffId));
    }
}

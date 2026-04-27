package fr.hoenheimsports.backend.teamservice.repository;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import fr.hoenheimsports.backend.teamservice.entities.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
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

    private Season season;
    private AgeGroup ageGroup;

    @BeforeEach
    void setUp() {
        season = new Season();
        season.setStartDate(LocalDate.of(2025, 9, 1));
        season.setEndDate(LocalDate.of(2026, 6, 30));
        season.setName("Saison 2025-2026");
        entityManager.persist(season);

        ageGroup = new AgeGroup();
        ageGroup.setAgeLimit(18);
        ageGroup.setUpperLimit(true);
        entityManager.persist(ageGroup);

        entityManager.flush();
    }

    @Nested
    class CRUDOperations {
        @Test
        void shouldSaveAndVerifyAllFields() {
            // Arrange
            Team team = new Team();
            team.setSeasonId(season.getId());
            team.setGender(Gender.Male);
            team.setName(new TeamName(1, ageGroup));
            team.setPhotoFileName("team.png");

            // Act
            Team saved = teamRepository.saveAndFlush(team);
            entityManager.clear();
            Team found = teamRepository.findById(saved.getId()).orElseThrow();

            // Assert
            assertThat(found.getId()).isEqualTo(saved.getId());
            assertThat(found.getSeasonId()).isEqualTo(season.getId());
            assertThat(found.getGender()).isEqualTo(Gender.Male);
            assertThat(found.getName().teamNumber()).isEqualTo(1);
            assertThat(found.getName().ageGroup().getId()).isEqualTo(ageGroup.getId());
            assertThat(found.getPhotoFileName()).isEqualTo("team.png");
        }

        @Test
        void shouldDeleteTeam() {
            Team team = new Team();
            team.setSeasonId(season.getId());
            team.setGender(Gender.Male);
            team.setName(new TeamName(1, ageGroup));
            Team saved = teamRepository.saveAndFlush(team);

            teamRepository.delete(saved);
            teamRepository.flush();

            assertThat(teamRepository.findById(saved.getId())).isEmpty();
        }
    }

    @Nested
    class CustomQueries {
        @Test
        void shouldFindAllBySeasonId() {
            // Arrange
            Team team = new Team();
            team.setSeasonId(season.getId());
            team.setGender(Gender.Male);
            team.setName(new TeamName(1, ageGroup));
            teamRepository.saveAndFlush(team);

            // Act
            List<Team> teams = teamRepository.findAllBySeasonId(season.getId());

            // Assert
            assertThat(teams).hasSize(1);
            assertThat(teams.getFirst().getSeasonId()).isEqualTo(season.getId());
        }

        @Test
        void shouldReturnEmptyList_WhenNoTeamsForSeason() {
            List<Team> teams = teamRepository.findAllBySeasonId(UUID.randomUUID());
            assertThat(teams).isEmpty();
        }

        @Test
        void shouldFindDistinctByStaffs_StaffId() {
            // Arrange
            UUID staffId = UUID.randomUUID();

            Team team = new Team();
            team.setSeasonId(season.getId());
            team.setGender(Gender.Female);
            team.setName(new TeamName(1, ageGroup));

            TeamStaff teamStaff = new TeamStaff();
            teamStaff.setStaffId(staffId);
            teamStaff.setRole(Role.COACH);
            team.addStaff(teamStaff);

            teamRepository.saveAndFlush(team);

            // Act
            List<Team> teams = teamRepository.findDistinctByStaffs_StaffId(staffId);

            // Assert
            assertThat(teams).hasSize(1);
            assertThat(teams.getFirst().getStaffs()).anyMatch(s -> s.getStaffId().equals(staffId));
        }

        @Test
        void shouldReturnEmptyList_WhenStaffHasNoTeam() {
            List<Team> teams = teamRepository.findDistinctByStaffs_StaffId(UUID.randomUUID());
            assertThat(teams).isEmpty();
        }
    }
}

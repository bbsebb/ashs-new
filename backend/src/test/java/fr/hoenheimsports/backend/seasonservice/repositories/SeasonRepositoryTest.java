package fr.hoenheimsports.backend.seasonservice.repositories;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@SuppressWarnings("DataFlowIssue")
class SeasonRepositoryTest {

    @Autowired
    private SeasonRepository seasonRepository;

    @Nested
    class CRUDOperations {
        @Test
        void shouldSaveAndFindSeason_AndVerifyAllFields() {
            // Arrange
            Season season = new Season();
            season.setStartDate(LocalDate.of(2025, 9, 1));
            season.setEndDate(LocalDate.of(2026, 6, 30));
            season.setName("Saison 2025-2026");

            // Act
            Season savedSeason = seasonRepository.saveAndFlush(season);
            Optional<Season> foundSeason = seasonRepository.findById(savedSeason.getId());

            // Assert
            assertThat(foundSeason).isPresent();
            assertThat(foundSeason.get().getId()).isEqualTo(savedSeason.getId());
            assertThat(foundSeason.get().getName()).isEqualTo("Saison 2025-2026");
            assertThat(foundSeason.get().getStartDate()).isEqualTo(LocalDate.of(2025, 9, 1));
            assertThat(foundSeason.get().getEndDate()).isEqualTo(LocalDate.of(2026, 6, 30));
        }

        @Test
        void shouldUpdateSeason_AndVerifyChanges() {
            // Arrange
            Season season = new Season();
            season.setStartDate(LocalDate.of(2025, 9, 1));
            season.setEndDate(LocalDate.of(2026, 6, 30));
            season.setName("Old Name");
            Season saved = seasonRepository.saveAndFlush(season);

            // Act
            saved.setName("New Name");
            saved.setStartDate(LocalDate.of(2025, 10, 1));
            Season updated = seasonRepository.saveAndFlush(saved);

            // Assert
            assertThat(updated.getName()).isEqualTo("New Name");
            assertThat(updated.getStartDate()).isEqualTo(LocalDate.of(2025, 10, 1));
        }

        @Test
        void shouldDeleteSeason() {
            // Arrange
            Season season = new Season();
            season.setStartDate(LocalDate.of(2025, 9, 1));
            season.setEndDate(LocalDate.of(2026, 6, 30));
            season.setName("To Delete");
            Season saved = seasonRepository.saveAndFlush(season);

            // Act
            seasonRepository.delete(saved);
            seasonRepository.flush();

            // Assert
            assertThat(seasonRepository.findById(saved.getId())).isEmpty();
        }

        @Test
        void shouldReturnAllSeasons() {
            // Arrange
            Season s1 = new Season();
            s1.setStartDate(LocalDate.of(2023, 9, 1));
            s1.setEndDate(LocalDate.of(2024, 6, 30));
            s1.setName("S1");

            Season s2 = new Season();
            s2.setStartDate(LocalDate.of(2024, 9, 1));
            s2.setEndDate(LocalDate.of(2025, 6, 30));
            s2.setName("S2");

            seasonRepository.saveAllAndFlush(List.of(s1, s2));

            // Act
            List<Season> all = seasonRepository.findAll();

            // Assert
            assertThat(all).hasSizeGreaterThanOrEqualTo(2);
        }
    }

    @Nested
    class DataIntegrity {
        @Test
        void shouldThrowException_WhenDatesAreInvalidAtDatabaseLevel() {
            // Arrange
            Season invalidSeason = new Season();
            invalidSeason.setStartDate(LocalDate.of(2026, 1, 1));
            invalidSeason.setEndDate(LocalDate.of(2025, 1, 1));
            invalidSeason.setName("Invalid Season");

            // Act & Assert
            assertThatThrownBy(() -> seasonRepository.saveAndFlush(invalidSeason)).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        void shouldThrowException_WhenNameIsNull() {
            Season season = new Season();
            season.setStartDate(LocalDate.of(2025, 9, 1));
            season.setEndDate(LocalDate.of(2026, 6, 30));
            season.setName(null);

            assertThatThrownBy(() -> seasonRepository.saveAndFlush(season)).isInstanceOf(DataIntegrityViolationException.class);
        }
    }
}

package fr.hoenheimsports.backend.seasonservice.repositories;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@org.springframework.test.context.ActiveProfiles("test")
class SeasonRepositoryTest {

    @Autowired
    private SeasonRepository seasonRepository;

    @Test
    void shouldSaveAndFindSeason() {
        // Arrange
        Season season = new Season();
        season.setStartDate(LocalDate.of(2025, 9, 1));
        season.setEndDate(LocalDate.of(2026, 6, 30));
        season.setName("Saison 2025-2026");

        // Act
        Season savedSeason = seasonRepository.save(season);
        Optional<Season> foundSeason = seasonRepository.findById(savedSeason.getId());

        // Assert
        assertThat(foundSeason).isPresent();
        assertThat(foundSeason.get().getName()).isEqualTo("Saison 2025-2026");
        assertThat(foundSeason.get().getStartDate()).isEqualTo(LocalDate.of(2025, 9, 1));
    }

    @Test
    void shouldThrowException_WhenDatesAreInvalidAtDatabaseLevel() {
        // Arrange
        // La contrainte SQL est start_date < end_date
        Season invalidSeason = new Season();
        invalidSeason.setStartDate(LocalDate.of(2026, 1, 1));
        invalidSeason.setEndDate(LocalDate.of(2025, 1, 1));
        invalidSeason.setName("Invalid Season");

        // Act & Assert
        // On doit flusher pour forcer l'exécution du SQL et voir la violation de contrainte
        assertThatThrownBy(() -> {
            seasonRepository.saveAndFlush(invalidSeason);
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}

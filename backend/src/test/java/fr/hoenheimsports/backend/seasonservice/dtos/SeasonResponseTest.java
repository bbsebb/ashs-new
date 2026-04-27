package fr.hoenheimsports.backend.seasonservice.dtos;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SeasonResponseTest {

    @Test
    void isCurrent_ShouldBeTrue_WhenTodayIsWithinRange() {
        // Arrange
        LocalDate start = LocalDate.now().minusMonths(1);
        LocalDate end = LocalDate.now().plusMonths(1);

        // Act
        SeasonResponse response = new SeasonResponse(UUID.randomUUID(), start, end, "Current", false);

        // Assert
        assertThat(response.isCurrent()).isTrue();
    }

    @Test
    void isCurrent_ShouldBeFalse_WhenTodayIsBeforeRange() {
        // Arrange
        LocalDate start = LocalDate.now().plusMonths(1);
        LocalDate end = LocalDate.now().plusMonths(2);

        // Act
        SeasonResponse response = new SeasonResponse(UUID.randomUUID(), start, end, "Future", false);

        // Assert
        assertThat(response.isCurrent()).isFalse();
    }

    @Test
    void isCurrent_ShouldBeFalse_WhenTodayIsAfterRange() {
        // Arrange
        LocalDate start = LocalDate.now().minusMonths(2);
        LocalDate end = LocalDate.now().minusMonths(1);

        // Act
        SeasonResponse response = new SeasonResponse(UUID.randomUUID(), start, end, "Past", false);

        // Assert
        assertThat(response.isCurrent()).isFalse();
    }
}

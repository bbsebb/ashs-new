package fr.hoenheimsports.backend.teamservice.entities;

import fr.hoenheimsports.backend.teamservice.exceptions.InvalidTimeSlotException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TimeSlotTest {

    @ParameterizedTest
    @CsvSource({
            "10:00, 11:00",
            "00:00, 23:59",
            "18:30, 20:00"
    })
    void shouldCreateTimeSlot_WhenTimesAreValid(String start, String end) {
        // Act
        TimeSlot timeSlot = new TimeSlot(LocalTime.parse(start), LocalTime.parse(end));

        // Assert
        assertThat(timeSlot.startTime()).isEqualTo(LocalTime.parse(start));
        assertThat(timeSlot.endTime()).isEqualTo(LocalTime.parse(end));
    }

    @ParameterizedTest
    @CsvSource({
            "11:00, 10:00", // Fin avant début
            "10:00, 10:00"  // Même heure
    })
    void shouldThrowException_WhenTimesAreInvalid(String start, String end) {
        // Act & Assert
        assertThatThrownBy(() -> new TimeSlot(LocalTime.parse(start), LocalTime.parse(end)))
                .isInstanceOf(InvalidTimeSlotException.class)
                .hasMessageContaining("L'heure de début doit être avant l'heure de fin");
    }

    @Test
    void shouldThrowException_WhenStartTimeIsNull() {
        // Act & Assert
        assertThatThrownBy(() -> new TimeSlot(null, LocalTime.now()))
                .isInstanceOf(NullPointerException.class);
        // Note: Actuellement c'est une NPE, on pourrait l'améliorer en InvalidTimeSlotException
    }
}

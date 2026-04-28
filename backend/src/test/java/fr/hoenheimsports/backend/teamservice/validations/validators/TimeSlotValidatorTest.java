package fr.hoenheimsports.backend.teamservice.validations.validators;

import fr.hoenheimsports.backend.teamservice.dtos.TimeSlotDTO;
import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.time.LocalTime;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class TimeSlotValidatorTest {

    private TimeSlotValidator validator;
    private ConstraintValidatorContext context;

    @BeforeEach
    void setUp() {
        validator = new TimeSlotValidator();
        context = mock(ConstraintValidatorContext.class);
    }

    @Test
    void shouldReturnTrue_WhenTimeSlotIsValid() {
        TimeSlotDTO timeSlot = new TimeSlotDTO(LocalTime.of(18, 0), LocalTime.of(20, 0));
        assertThat(validator.isValid(timeSlot, context)).isTrue();
    }

    @ParameterizedTest
    @MethodSource("invalidTimeSlots")
    void shouldReturnFalse_WhenTimeSlotIsInvalid(TimeSlotDTO timeSlot) {
        assertThat(validator.isValid(timeSlot, context)).isFalse();
    }

    static Stream<Arguments> invalidTimeSlots() {
        return Stream.of(
                Arguments.of(new TimeSlotDTO(LocalTime.of(20, 0), LocalTime.of(18, 0))), // start after end
                Arguments.of(new TimeSlotDTO(LocalTime.of(18, 0), LocalTime.of(18, 0)))  // start equal to end
        );
    }

    @Test
    void shouldReturnTrue_WhenTimeSlotIsNull() {
        assertThat(validator.isValid(null, context)).isTrue(); // should let @NotNull handle it if necessary
    }
}

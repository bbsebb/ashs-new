package fr.hoenheimsports.backend.seasonservice.validations.validators;

import fr.hoenheimsports.backend.seasonservice.validations.annotations.DateRange;
import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DateRangeValidatorTest {

    private DateRangeValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @Mock
    private DateRange dateRange;

    @BeforeEach
    void setUp() {
        validator = new DateRangeValidator();
        // Configuration de l'annotation mockée
        when(dateRange.startDate()).thenReturn("startDate");
        when(dateRange.endDate()).thenReturn("endDate");
        validator.initialize(dateRange);
    }

    @ParameterizedTest
    @CsvSource({
            "2025-01-01, 2025-12-31, true",   // Cas normal
            "2025-01-01, 2025-01-02, true",   // Intervalle minimal
            "2025-12-31, 2025-01-01, false",  // Inversé
            "2025-01-01, 2025-01-01, false"   // Même jour (non autorisé par isBefore)
    })
    void shouldValidateDateRange(String start, String end, boolean expected) {
        TestObject testObject = new TestObject(LocalDate.parse(start), LocalDate.parse(end));
        assertThat(validator.isValid(testObject, context)).isEqualTo(expected);
    }

    @Test
    void shouldReturnTrueWhenDatesAreNull() {
        // Le validateur retourne true si les dates sont nulles (laissant @NotNull gérer)
        TestObject testObject = new TestObject(null, null);
        assertThat(validator.isValid(testObject, context)).isTrue();
    }

    @Test
    void shouldReturnTrueWhenOneDateIsNull() {
        TestObject testObject = new TestObject(LocalDate.now(), null);
        assertThat(validator.isValid(testObject, context)).isTrue();
    }

    // Classe interne pour le test
    record TestObject(LocalDate startDate, LocalDate endDate) {
    }
}

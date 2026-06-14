package fr.hoenheimsports.backend.teamservice.entities;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AgeGroupTest {

    private AgeGroup createAgeGroup(int ageLimit, boolean upperLimit) {
        AgeGroup ageGroup = new AgeGroup();
        ageGroup.setAgeLimit(ageLimit);
        ageGroup.setUpperLimit(upperLimit);
        return ageGroup;
    }

    @Nested
    class CompareTo {

        @Test
        void shouldReturnNegative_WhenComparingUpperLimitTrueWithFalse() {
            // U18 vs Seniors (Seniors doesn't have upperLimit)
            AgeGroup u18 = createAgeGroup(18, true);
            AgeGroup seniors = createAgeGroup(18, false);

            assertThat(u18.compareTo(seniors)).isNegative();
        }

        @Test
        void shouldReturnPositive_WhenComparingUpperLimitFalseWithTrue() {
            // Seniors vs U18
            AgeGroup seniors = createAgeGroup(18, false);
            AgeGroup u18 = createAgeGroup(18, true);

            assertThat(seniors.compareTo(u18)).isPositive();
        }

        @Test
        void shouldReturnNegative_WhenSameUpperLimitAndThisAgeIsSmaller() {
            // U13 vs U18
            AgeGroup u13 = createAgeGroup(13, true);
            AgeGroup u18 = createAgeGroup(18, true);

            assertThat(u13.compareTo(u18)).isNegative();
        }

        @Test
        void shouldReturnPositive_WhenSameUpperLimitAndThisAgeIsGreater() {
            // U18 vs U13
            AgeGroup u18 = createAgeGroup(18, true);
            AgeGroup u13 = createAgeGroup(13, true);

            assertThat(u18.compareTo(u13)).isPositive();
        }

        @Test
        void shouldReturnZero_WhenSameUpperLimitAndSameAge() {
            AgeGroup u18a = createAgeGroup(18, true);
            AgeGroup u18b = createAgeGroup(18, true);

            assertThat(u18a.compareTo(u18b)).isZero();
        }

        @Test
        void shouldThrowNullPointerException_WhenComparingToNull() {
            AgeGroup u18 = createAgeGroup(18, true);

            assertThatThrownBy(() -> u18.compareTo(null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        void shouldHandleEdgeCasesForAgeLimit() {
            AgeGroup groupMin = createAgeGroup(1, true);
            AgeGroup groupMax = createAgeGroup(Integer.MAX_VALUE, true);

            assertThat(groupMin.compareTo(groupMax)).isNegative();
            assertThat(groupMax.compareTo(groupMin)).isPositive();
        }
    }
}

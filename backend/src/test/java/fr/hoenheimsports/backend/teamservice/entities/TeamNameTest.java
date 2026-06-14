package fr.hoenheimsports.backend.teamservice.entities;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TeamNameTest {

    private AgeGroup createAgeGroup(int ageLimit, boolean upperLimit) {
        AgeGroup ageGroup = new AgeGroup();
        ageGroup.setAgeLimit(ageLimit);
        ageGroup.setUpperLimit(upperLimit);
        return ageGroup;
    }

    @Nested
    class CompareTo {

        @Test
        void shouldCompareByAgeGroupFirst() {
            // U13 vs U18 (different age groups)
            AgeGroup u13Group = createAgeGroup(13, true);
            AgeGroup u18Group = createAgeGroup(18, true);

            TeamName u13Team2 = new TeamName(2, u13Group);
            TeamName u18Team1 = new TeamName(1, u18Group);

            // Even though team number 2 is greater than 1, u13Team2 should come first because of the ageGroup
            assertThat(u13Team2.compareTo(u18Team1)).isNegative();
            assertThat(u18Team1.compareTo(u13Team2)).isPositive();
        }

        @Test
        void shouldCompareByTeamNumberWhenAgeGroupIsSame() {
            AgeGroup u18Group = createAgeGroup(18, true);

            TeamName u18Team1 = new TeamName(1, u18Group);
            TeamName u18Team2 = new TeamName(2, u18Group);

            assertThat(u18Team1.compareTo(u18Team2)).isNegative();
            assertThat(u18Team2.compareTo(u18Team1)).isPositive();
        }

        @Test
        void shouldReturnZeroWhenAgeGroupAndTeamNumberAreSame() {
            AgeGroup u18Group1 = createAgeGroup(18, true);
            AgeGroup u18Group2 = createAgeGroup(18, true); // same characteristics, compareTo will return 0

            TeamName name1 = new TeamName(1, u18Group1);
            TeamName name2 = new TeamName(1, u18Group2);

            assertThat(name1.compareTo(name2)).isZero();
        }

        @Test
        void shouldThrowNullPointerException_WhenComparingToNull() {
            AgeGroup u18Group = createAgeGroup(18, true);
            TeamName name1 = new TeamName(1, u18Group);

            assertThatThrownBy(() -> name1.compareTo(null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        void shouldThrowNullPointerException_WhenAgeGroupIsNull() {
            TeamName name1 = new TeamName(1, null);
            TeamName name2 = new TeamName(1, createAgeGroup(18, true));

            assertThatThrownBy(() -> name1.compareTo(name2))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        void shouldHandleLimitsOfTeamNumber() {
            AgeGroup u18Group = createAgeGroup(18, true);

            TeamName nameMin = new TeamName(1, u18Group);
            TeamName nameMax = new TeamName(9, u18Group);

            assertThat(nameMin.compareTo(nameMax)).isNegative();
            assertThat(nameMax.compareTo(nameMin)).isPositive();
        }
    }
}

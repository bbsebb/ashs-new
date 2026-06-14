package fr.hoenheimsports.backend.teamservice.entities;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TeamTest {

    private AgeGroup createAgeGroup(int ageLimit, boolean upperLimit) {
        AgeGroup ageGroup = new AgeGroup();
        ageGroup.setAgeLimit(ageLimit);
        ageGroup.setUpperLimit(upperLimit);
        return ageGroup;
    }

    private Team createTeam(TeamName name, Gender gender) {
        Team team = new Team();
        team.setSeasonId(UUID.randomUUID());
        team.setName(name);
        team.setGender(gender);
        return team;
    }

    @Nested
    class CompareTo {

        @Test
        void shouldCompareByNameFirst() {
            AgeGroup u13Group = createAgeGroup(13, true);
            AgeGroup u18Group = createAgeGroup(18, true);

            Team u13TeamMale = createTeam(new TeamName(1, u13Group), Gender.Male);
            Team u18TeamFemale = createTeam(new TeamName(1, u18Group), Gender.Female);

            // u13TeamMale should come first because of its name (age group is smaller) even though Female is compared after Male
            assertThat(u13TeamMale.compareTo(u18TeamFemale)).isNegative();
            assertThat(u18TeamFemale.compareTo(u13TeamMale)).isPositive();
        }

        @Test
        void shouldCompareByGenderWhenNameIsSame() {
            AgeGroup u18Group = createAgeGroup(18, true);
            TeamName name = new TeamName(1, u18Group);

            // Gender ordinals: Male (0) < Female (1) < Mixte (2)
            Team teamMale = createTeam(name, Gender.Male);
            Team teamFemale = createTeam(name, Gender.Female);
            Team teamMixte = createTeam(name, Gender.Mixte);

            assertThat(teamMale.compareTo(teamFemale)).isNegative();
            assertThat(teamFemale.compareTo(teamMixte)).isNegative();
            assertThat(teamFemale.compareTo(teamMale)).isPositive();
            assertThat(teamMixte.compareTo(teamFemale)).isPositive();
        }

        @Test
        void shouldReturnZeroWhenNameAndGenderAreSame() {
            AgeGroup u18Group = createAgeGroup(18, true);
            TeamName name1 = new TeamName(1, u18Group);
            TeamName name2 = new TeamName(1, u18Group);

            Team team1 = createTeam(name1, Gender.Male);
            Team team2 = createTeam(name2, Gender.Male);

            assertThat(team1.compareTo(team2)).isZero();
        }

        @Test
        void shouldThrowNullPointerException_WhenComparingToNull() {
            AgeGroup u18Group = createAgeGroup(18, true);
            Team team = createTeam(new TeamName(1, u18Group), Gender.Male);

            assertThatThrownBy(() -> team.compareTo(null))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        void shouldThrowNullPointerException_WhenNameIsNull() {
            Team team1 = createTeam(null, Gender.Male);
            Team team2 = createTeam(new TeamName(1, createAgeGroup(18, true)), Gender.Male);

            assertThatThrownBy(() -> team1.compareTo(team2))
                    .isInstanceOf(NullPointerException.class);
        }

        @Test
        void shouldThrowNullPointerException_WhenGenderIsNull() {
            AgeGroup u18Group = createAgeGroup(18, true);
            TeamName name = new TeamName(1, u18Group);

            Team team1 = createTeam(name, null);
            Team team2 = createTeam(name, Gender.Male);

            assertThatThrownBy(() -> team1.compareTo(team2))
                    .isInstanceOf(NullPointerException.class);
        }
    }
}

package fr.hoenheimsports.backend.teamservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.Comparator;

/**
 * JPA Embeddable record representing a team's name components: its number and age group.
 *
 * @param teamNumber the team's number (must be between 1 and 9)
 * @param ageGroup   the associated age group entity
 */
@Embeddable
public record TeamName(
        @Min(1)
        @Max(9)
        @Column(name = "name", length = 50, nullable = false)
        int teamNumber,
        @ManyToOne(fetch = FetchType.EAGER)
        @JoinColumn(name = "age_group_id", nullable = false)
        AgeGroup ageGroup
) implements Comparable<TeamName> {

    /**
     * Compares this team name with another based on age group and team number.
     *
     * @param o the team name to compare with
     * @return a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object
     */
    @Override
    public int compareTo(TeamName o) {
        return Comparator
                .comparing(TeamName::ageGroup)
                .thenComparingInt(TeamName::teamNumber)
                .compare(this, o);
    }
}

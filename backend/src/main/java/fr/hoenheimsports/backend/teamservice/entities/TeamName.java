package fr.hoenheimsports.backend.teamservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.Comparator;

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

    @Override
    public int compareTo(TeamName o) {
        return Comparator
                .comparing(TeamName::ageGroup)
                .thenComparingInt(TeamName::teamNumber)
                .compare(this, o);
    }
}

package fr.hoenheimsports.backend.seasonservice.entities;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "season",
        schema = "season_schema",
        check = @CheckConstraint(
        name = "check_timeslot_range",
        constraint = "start_time < end_time"
))
public class Season {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}

package fr.hoenheimsports.backend.seasonservice.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.proxy.HibernateProxy;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

/**
 * JPA entity representing a sports season with a defined start and end date.
 */
@Entity
@Table(
        name = "season",
        schema = "season_schema",
        check = @CheckConstraint(
        name = "check_timeslot_range",
                constraint = "start_date < end_date"
))
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class Season {
    /**
     * Unique identifier for the season.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * The start date of the season.
     */
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /**
     * The end date of the season.
     */
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /**
     * The display name of the season (e.g., "Season 2025 - 2026").
     */
    @Column(name = "name", nullable = false)
    private String name;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Season season = (Season) o;
        return Objects.equals(getId(), season.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}

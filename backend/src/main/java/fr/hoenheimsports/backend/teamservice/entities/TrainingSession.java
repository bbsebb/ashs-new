package fr.hoenheimsports.backend.teamservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.proxy.HibernateProxy;

import java.time.DayOfWeek;
import java.util.Objects;
import java.util.UUID;

/**
 * JPA entity representing a scheduled training session for a team.
 * Specifies the hall, the day of the week, the time slot, and the associated team.
 */
@Entity
@Table(
        name = "training_session",
        schema = "team_schema",
        check = @CheckConstraint(
                name = "check_timeslot_range",
                constraint = "start_time < end_time"
        ))
@Getter
@Setter
@ToString
public class TrainingSession {

    /**
     * Unique identifier for the training session.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Unique identifier of the hall where training is scheduled (defined in the hall module).
     */
    @Column(name = "hall_id", nullable = false)
    private UUID hallId;

    /**
     * The day of the week of the training session.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    /**
     * The embedded time slot specifying start and end times.
     */
    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "startTime", column = @Column(name = "start_time", nullable = false)),
            @AttributeOverride(name = "endTime", column = @Column(name = "end_time", nullable = false))
    })
    @NotNull
    private TimeSlot timeSlot;

    /**
     * The team associated with this training session.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    @NotNull
    @ToString.Exclude
    private Team team;

    /**
     * Constructs a new default TrainingSession.
     */
    public TrainingSession() {
    }

    /**
     * Checks if this training session is equal to another object based on their identifiers.
     *
     * @param o the object to compare with
     * @return true if equal, false otherwise
     */
    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        TrainingSession that = (TrainingSession) o;
        return Objects.equals(getId(), that.getId());
    }

    /**
     * Returns the hash code of the training session.
     *
     * @return the hash code value
     */
    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}

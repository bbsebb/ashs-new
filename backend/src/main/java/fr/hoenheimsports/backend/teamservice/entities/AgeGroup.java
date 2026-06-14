package fr.hoenheimsports.backend.teamservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.util.Objects;
import java.util.UUID;

/**
 * JPA entity representing an age group category (e.g., U11, U18, Seniors).
 */
@Entity
@Table(name = "age_group", schema = "team_schema")
@Setter
@ToString
@RequiredArgsConstructor
@Getter
public class AgeGroup implements Comparable<AgeGroup> {
    /**
     * Unique identifier for the age group.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    /**
     * The numeric age limit for this group.
     */
    @Min(value = 1, message = "L'âge limite doit être supérieur à 0")
    @Column(name = "age_limit", nullable = false, check = @CheckConstraint(constraint = "age_limit > 0"))
    private int ageLimit;

    /**
     * Indicates if the age limit is an upper limit (e.g., U18) or lower limit (e.g., Seniors).
     */
    @Column(name = "is_upper_limit")
    private boolean upperLimit;


    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        AgeGroup ageGroup = (AgeGroup) o;
        return Objects.equals(getId(), ageGroup.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }

    @Override
    public int compareTo(AgeGroup o) {
        if (this.upperLimit != o.upperLimit) {
            return this.upperLimit ? -1 : 1;
        }
        return Integer.compare(this.ageLimit, o.ageLimit);
    }
}

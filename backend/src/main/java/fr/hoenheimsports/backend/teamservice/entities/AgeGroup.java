package fr.hoenheimsports.backend.teamservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
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

    /**
     * Constructs a new default AgeGroup.
     */
    public AgeGroup() {
    }

    /**
     * Checks if this age group is equal to another object based on their identifiers.
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
        AgeGroup ageGroup = (AgeGroup) o;
        return Objects.equals(getId(), ageGroup.getId());
    }

    /**
     * Returns the hash code of the age group.
     *
     * @return the hash code value
     */
    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }

    /**
     * Compares this age group with another to determine ordering.
     *
     * @param o the age group to compare with
     * @return a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object
     */
    @Override
    public int compareTo(AgeGroup o) {
        if (this.upperLimit != o.upperLimit) {
            return this.upperLimit ? -1 : 1;
        }
        return Integer.compare(this.ageLimit, o.ageLimit);
    }
}

package fr.hoenheimsports.backend.teamservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.proxy.HibernateProxy;

import java.util.Objects;
import java.util.UUID;

/**
 * JPA entity representing the association between a staff member and a team, including their role.
 */
@Entity
@Table(name = "team_staff", schema = "team_schema")
@Getter
@Setter
@ToString
public class TeamStaff {

    /**
     * Unique identifier for the team staff association.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    /**
     * The role of the staff member in the team.
     */
    @Column(name = "role", nullable = false)
    @NotNull
    @Enumerated(EnumType.STRING)
    private Role role;

    /**
     * The team associated with this staff member.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    @NotNull
    @ToString.Exclude
    private Team team;

    /**
     * The unique identifier of the staff member (defined in the staff module).
     */
    @Column(name = "staff_id", nullable = false)
    @NotNull
    private UUID staffId;

    /**
     * Constructs a new default TeamStaff.
     */
    public TeamStaff() {
    }

    /**
     * Checks if this team staff association is equal to another object based on their identifiers.
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
        TeamStaff teamStaff = (TeamStaff) o;
        return Objects.equals(getId(), teamStaff.getId());
    }

    /**
     * Returns the hash code of the team staff association.
     *
     * @return the hash code value
     */
    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}

package fr.hoenheimsports.backend.hallservice.entities;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.util.Objects;
import java.util.UUID;

/**
 * JPA entity representing a sports hall or venue.
 */
@Entity
@Table(name = "hall", schema = "hall_schema")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class Hall {
    /**
     * Unique identifier for the hall.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    /**
     * The name of the hall.
     */
    @NotBlank
    @Size(max = 50, message = "La nom de la salle ne doit pas dépasser 50 caractères")
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    /**
     * The embedded physical address of the hall.
     */
    @Embedded
    @NotNull
    @Valid
    private Address address;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Hall hall = (Hall) o;
        return Objects.equals(getId(), hall.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}

package fr.hoenheimsports.backend.staffservice.entities;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;
import org.jspecify.annotations.Nullable;

import java.util.Objects;
import java.util.UUID;

/**
 * JPA entity representing a staff member of the club.
 */
@Entity
@Table(name = "staff", schema = "staff_schema")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class Staff {
    /**
     * Unique identifier for the staff member.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    /**
     * First name of the staff member.
     */
    @NotBlank
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    /**
     * Last name of the staff member.
     */
    @NotBlank
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    /**
     * Embedded email address value object.
     */
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "email", length = 100))
    @Valid
    private Email email;

    /**
     * Embedded phone number value object.
     */
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "phone", length = 20))
    @Valid
    private Phone phone;

    /**
     * Name of the avatar file stored on the filesystem.
     */
    @Column(name = "avatar_file_name", length = 50)
    @Nullable
    private String avatarFileName;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Staff staff = (Staff) o;
        return Objects.equals(getId(), staff.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}

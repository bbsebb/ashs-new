package fr.hoenheimsports.backend.staffservice.entities;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "staff", schema = "staff_schema")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    @NotBlank
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;
    @NotBlank
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "email", length = 100))
    @Valid
    private Email email;
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "phone", length = 20))
    @Valid
    private Phone phone;
    @Column(name = "file_name", length = 50)
    private String fileName;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
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

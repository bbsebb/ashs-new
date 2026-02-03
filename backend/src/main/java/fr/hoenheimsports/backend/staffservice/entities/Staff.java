package fr.hoenheimsports.backend.staffservice.entities;

import jakarta.persistence.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @Size(max = 50, message = "Le prénom ne doit pas dépasser 50 caractères")
    @Column(name = "first_name",nullable = false,length = 50)
    private String firstName;
    @NotBlank
    @Size(max = 50, message = "Le nom de famille ne doit pas dépasser 50 caractères")
    @Column(name = "last_name",nullable = false,length = 50)
    private String lastName;
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "email",length = 100))
    @Size(max = 100, message = "L'email ne doit pas dépasser 100 caractères")
    @jakarta.validation.constraints.Email
    private Email email;
    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "phone",length = 20))
    @Size(max = 20, message = "Le numéro de téléphone ne doit pas dépasser 20 caractères")
    private Phone phone;

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

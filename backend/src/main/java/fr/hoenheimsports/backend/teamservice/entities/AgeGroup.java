package fr.hoenheimsports.backend.teamservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;
import org.jspecify.annotations.Nullable;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "age_group",schema = "team_schema")
@Setter
@ToString
@RequiredArgsConstructor
@Getter
public class AgeGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID )
    @Setter(AccessLevel.NONE)
    private UUID uuid;

    @Min(value = 1, message = "L'âge limite doit être supérieur à 0")
    @Column(name = "age_limit", nullable = false, check = @CheckConstraint(constraint = "age_limit > 0"))
    private int ageLimit; // ex: 11, 18


    private boolean isUpperLimit;



    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        AgeGroup ageGroup = (AgeGroup) o;
        return Objects.equals(getUuid(), ageGroup.getUuid());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}

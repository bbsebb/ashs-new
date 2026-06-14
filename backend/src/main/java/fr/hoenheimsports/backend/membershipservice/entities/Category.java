package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.jspecify.annotations.NullMarked;

import java.util.Objects;

/**
 * Value object representing a membership category within a campaign.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@NullMarked
public class Category {

    /**
     * The unique name of the membership category (e.g. "Seniors", "U15").
     */
    @NotBlank
    @Column(name = "category_name", nullable = false)
    private String name;

    /**
     * The price associated with the category.
     */
    @Embedded
    @AttributeOverride(name = "amount", column = @Column(name = "amount", nullable = false, precision = 19, scale = 2))
    private Price price;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return Objects.equals(name, category.name);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(name);
    }
}

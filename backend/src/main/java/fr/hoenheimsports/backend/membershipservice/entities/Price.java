package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import org.jspecify.annotations.NullMarked;

import java.math.BigDecimal;

/**
 * Value object representing a price or amount.
 */
@Embeddable
@NullMarked
public record Price(
    @NotNull
    @Column(name = "amount", nullable = false, precision = 19, scale = 2)
    BigDecimal amount
) {
    /**
     * Creates a Price instance from a String representation of the amount.
     *
     * @param amount the string amount
     * @return a new Price instance
     */
    public static Price of(String amount) {
        return new Price(new BigDecimal(amount));
    }

    /**
     * Creates a Price instance from a BigDecimal amount.
     *
     * @param amount the BigDecimal amount
     * @return a new Price instance
     */
    public static Price of(BigDecimal amount) {
        return new Price(amount);
    }
}

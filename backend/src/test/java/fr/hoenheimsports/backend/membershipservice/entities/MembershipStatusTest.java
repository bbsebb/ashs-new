package fr.hoenheimsports.backend.membershipservice.entities;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MembershipStatus Enum Tests")
class MembershipStatusTest {

    @Test
    @DisplayName("Should contain EXPIRED status value")
    void shouldContainExpiredStatus() {
        assertThat(MembershipStatus.valueOf("EXPIRED")).isEqualTo(MembershipStatus.EXPIRED);
    }
}

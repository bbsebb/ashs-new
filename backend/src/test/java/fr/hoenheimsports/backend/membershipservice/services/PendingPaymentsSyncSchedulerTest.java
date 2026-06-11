package fr.hoenheimsports.backend.membershipservice.services;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("PendingPaymentsSyncScheduler Unit Tests")
class PendingPaymentsSyncSchedulerTest {

    @Mock
    private MembershipService membershipService;

    @InjectMocks
    private PendingPaymentsSyncScheduler scheduler;

    @Test
    @DisplayName("Should invoke syncPendingPayments on MembershipService")
    void shouldInvokeSyncPendingPayments() {
        // When
        scheduler.syncPendingPayments();

        // Then
        verify(membershipService).syncPendingPayments();
    }

    @Test
    @DisplayName("Should handle exceptions thrown by MembershipService gracefully")
    void shouldHandleExceptionsGracefully() {
        // Given
        doThrow(new RuntimeException("Database offline")).when(membershipService).syncPendingPayments();

        // When
        scheduler.syncPendingPayments();

        // Then
        verify(membershipService).syncPendingPayments();
    }
}

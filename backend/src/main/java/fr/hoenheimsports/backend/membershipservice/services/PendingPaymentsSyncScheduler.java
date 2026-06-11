package fr.hoenheimsports.backend.membershipservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for synchronizing pending SumUp payments.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PendingPaymentsSyncScheduler {

    private final MembershipService membershipService;

    /**
     * Scheduled task to synchronize pending payments once a day at 03:00 AM.
     * Cron expression "0 0 3 * * *" runs at 3:00 AM every day.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void syncPendingPayments() {
        log.info("Scheduled synchronization of pending payments started");
        try {
            this.membershipService.syncPendingPayments();
            log.info("Scheduled synchronization of pending payments completed successfully");
        } catch (Exception exception) {
            log.error("Error occurred during scheduled pending payments synchronization: {}", exception.getMessage(), exception);
        }
    }
}

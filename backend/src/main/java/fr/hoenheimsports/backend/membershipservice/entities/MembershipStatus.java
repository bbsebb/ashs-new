package fr.hoenheimsports.backend.membershipservice.entities;

/**
 * Enum representing the status of a membership payment or processing.
 */
public enum MembershipStatus {
    /**
     * The membership order has been created and is waiting for payment confirmation.
     */
    PENDING,

    /**
     * The payment was received successfully.
     */
    PAID,

    /**
     * The payment attempt failed.
     */
    FAILED,

    /**
     * The membership details and license have been validated by an administrator.
     */
    PROCESSED,

    /**
     * The payment session has expired.
     */
    EXPIRED
}

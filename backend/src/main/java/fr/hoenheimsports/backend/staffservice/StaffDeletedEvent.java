package fr.hoenheimsports.backend.staffservice;

import java.util.UUID;

/**
 * Event published when a staff member is deleted.
 *
 * @param id the unique identifier of the deleted staff member
 */
public record StaffDeletedEvent(UUID id) {
}

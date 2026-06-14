package fr.hoenheimsports.backend.teamservice.dtos;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.util.UUID;

/**
 * DTO response record representing a training session.
 *
 * @param id        the unique identifier of the training session
 * @param hallId    the unique identifier of the hall where training occurs
 * @param dayOfWeek the day of the week for the training session
 * @param timeSlot  the time slot details
 * @param teamId    the unique identifier of the associated team
 */
public record TrainingSessionResponseDTO(UUID id, UUID hallId, DayOfWeek dayOfWeek, TimeSlotDTO timeSlot,
                                         UUID teamId) implements Serializable {
}
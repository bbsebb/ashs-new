package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Gender;
import fr.hoenheimsports.backend.teamservice.entities.Role;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

public record TeamUpdateRequest(
        @NotNull Gender gender,
        int teamNumber,
        @NotNull UUID ageGroupId,
        List<TeamStaffUpdateRequest> staffs,
        List<TrainingSessionUpdateRequest> trainingSessions) {

    public record TeamStaffUpdateRequest(UUID id, @NotNull Role role, @NotNull UUID staffId) {
    }

    public record TrainingSessionUpdateRequest(UUID id, @NotNull UUID hallId, @NotNull DayOfWeek dayOfWeek,
                                               @NotNull TimeSlotDTO timeSlot) {
    }
}

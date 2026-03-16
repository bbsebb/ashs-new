package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Gender;
import fr.hoenheimsports.backend.teamservice.entities.Role;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record TeamEditRequest(
        @NotNull Gender gender,
        int teamNumber,
        @NotNull UUID ageGroupId,
        List<TeamStaffEditRequest> staffs,
        List<TrainingSessionEditRequest> trainingSessions) {

    public record TeamStaffEditRequest(UUID id, @NotNull Role role, @NotNull UUID coachId) {
    }

    public record TrainingSessionEditRequest(UUID id, @NotNull UUID hallId, @NotNull TimeSlotDTO timeSlot) {
    }
}

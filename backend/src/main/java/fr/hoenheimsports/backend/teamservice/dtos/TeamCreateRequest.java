package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Gender;
import fr.hoenheimsports.backend.teamservice.entities.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

public record TeamCreateRequest(@NotNull UUID seasonId, @NotNull Gender gender, int teamNumber,
                                UUID ageGroupId,
                                List<TeamStaffCreateRequest> staffs,
                                List<TrainingSessionCreateRequest> trainingSessions) {
    public record TeamStaffCreateRequest(@NotNull Role role, @NotNull UUID staffId) {

    }

    public record TrainingSessionCreateRequest(@NotNull UUID hallId, @NotNull DayOfWeek dayOfWeek,
                                               @Valid TimeSlotDTO timeSlot) {

    }
}




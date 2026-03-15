package fr.hoenheimsports.backend.teamservice.mappers;

import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.entities.Team;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING, uses = {TrainingSessionMapper.class})
public interface TeamMapper {


    @AfterMapping
    default void linkStaffs(@MappingTarget Team team) {
        team.getStaffs().forEach(staff -> staff.setTeam(team));
    }

    @AfterMapping
    default void linkTrainingSessions(@MappingTarget Team team) {
        team.getTrainingSessions().forEach(trainingSession -> trainingSession.setTeam(team));
    }

    @Mapping(target = "nameAgeGroupIsUpperLimit", source = "name.ageGroup.upperLimit")
    @Mapping(target = "nameAgeGroupAgeLimit", source = "name.ageGroup.ageLimit")
    @Mapping(target = "nameAgeGroupId", source = "name.ageGroup.id")
    @Mapping(target = "nameTeamNumber", source = "name.teamNumber")
    TeamReponseDTO toDto(Team team);

    @InheritConfiguration(name = "toEntity")
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    Team partialUpdate(TeamReponseDTO teamReponseDTO, @MappingTarget Team team);
}
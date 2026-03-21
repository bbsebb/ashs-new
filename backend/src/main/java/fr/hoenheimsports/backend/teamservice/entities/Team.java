package fr.hoenheimsports.backend.teamservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;
import org.jspecify.annotations.Nullable;

import java.util.*;

@Entity
@Table(name = "team", schema = "team_schema")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    @NotNull
    private UUID seasonId;

    @NotNull
    @Column(name = "gender", nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Embedded
    @NotNull
    private TeamName name;


    @Column(name = "photo_file_name", length = 50)
    @Nullable
    private String photoFileName;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Setter(AccessLevel.PRIVATE)
    private List<TeamStaff> staffs = new ArrayList<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Setter(AccessLevel.PRIVATE)
    private List<TrainingSession> trainingSessions = new ArrayList<>();

    public List<TrainingSession> getTrainingSessions() {
        return Collections.unmodifiableList(trainingSessions);
    }

    public List<TeamStaff> getStaffs() {
        return Collections.unmodifiableList(staffs);
    }

    public void addStaff(TeamStaff staff) {
        staffs.add(staff);
        staff.setTeam(this);
    }

    public void removeStaff(TeamStaff staff) {
        staffs.remove(staff);
    }

    public void addTrainingSession(TrainingSession trainingSession) {
        trainingSessions.add(trainingSession);
        trainingSession.setTeam(this);
    }

    public void removeTrainingSession(TrainingSession trainingSession) {
        trainingSessions.remove(trainingSession);
    }


    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Team team = (Team) o;
        return Objects.equals(getId(), team.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}

package fr.hoenheimsports.backend.teamservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.proxy.HibernateProxy;
import org.jspecify.annotations.Nullable;

import java.util.*;

/**
 * JPA entity representing a sports team.
 * A team is associated with a specific season, gender, and category (AgeGroup).
 * It contains lists of staff members and training sessions.
 */
@Entity
@Table(name = "team", schema = "team_schema")
@Getter
@Setter
@ToString
public class Team implements Comparable<Team> {
    /**
     * Unique identifier for the team.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    /**
     * ID of the season this team belongs to.
     */
    @NotNull
    private UUID seasonId;

    /**
     * Gender category of the team.
     */
    @NotNull
    @Column(name = "gender", nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    /**
     * Embedded name information, including age group and team number.
     */
    @Embedded
    @NotNull
    private TeamName name;

    /**
     * Filename of the team's official photo.
     */
    @Column(name = "photo_file_name", length = 50)
    @Nullable
    private String photoFileName;

    /**
     * List of staff members assigned to the team.
     */
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Setter(AccessLevel.PRIVATE)
    private List<TeamStaff> staffs = new ArrayList<>();

    /**
     * List of training sessions scheduled for the team.
     */
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Setter(AccessLevel.PRIVATE)
    private List<TrainingSession> trainingSessions = new ArrayList<>();

    /**
     * Constructs a new default Team.
     */
    public Team() {
    }

    /**
     * Returns an unmodifiable list of training sessions.
     *
     * @return the team's training sessions
     */
    public List<TrainingSession> getTrainingSessions() {
        return Collections.unmodifiableList(trainingSessions);
    }

    /**
     * Returns an unmodifiable list of staff members assigned to the team.
     *
     * @return the team's staff
     */
    public List<TeamStaff> getStaffs() {
        return Collections.unmodifiableList(staffs);
    }

    /**
     * Associates a staff member with this team.
     *
     * @param staff the staff member to add
     */
    public void addStaff(TeamStaff staff) {
        staffs.add(staff);
        staff.setTeam(this);
    }

    /**
     * Removes a staff member association from this team.
     *
     * @param staff the staff member to remove
     */
    public void removeStaff(TeamStaff staff) {
        staffs.remove(staff);
    }

    /**
     * Adds a training session to this team's schedule.
     *
     * @param trainingSession the session to add
     */
    public void addTrainingSession(TrainingSession trainingSession) {
        trainingSessions.add(trainingSession);
        trainingSession.setTeam(this);
    }

    /**
     * Removes a training session from this team's schedule.
     *
     * @param trainingSession the session to remove
     */
    public void removeTrainingSession(TrainingSession trainingSession) {
        trainingSessions.remove(trainingSession);
    }

    /**
     * Checks if this team is equal to another object based on their identifiers.
     *
     * @param o the object to compare with
     * @return true if equal, false otherwise
     */
    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Team team = (Team) o;
        return Objects.equals(getId(), team.getId());
    }

    /**
     * Returns the hash code of the team.
     *
     * @return the hash code value
     */
    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }

    /**
     * Compares this team with another to determine ordering based on name and gender.
     *
     * @param o the team to compare with
     * @return a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object
     */
    @Override
    public int compareTo(Team o) {
        return Comparator
                .comparing(Team::getName)
                .thenComparing(Team::getGender)
                .compare(this, o);
    }
}

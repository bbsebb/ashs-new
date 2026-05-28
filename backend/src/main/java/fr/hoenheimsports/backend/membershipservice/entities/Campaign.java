package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entity representing a membership campaign.
 */
@Entity
@Table(name = "campaigns", schema = "membership_schema")
@Getter
@Setter
@NoArgsConstructor
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "season_id", nullable = false)
    private UUID seasonId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CampaignStatus status;

    @ElementCollection
    @CollectionTable(name = "campaign_categories", schema = "membership_schema", joinColumns = @JoinColumn(name = "campaign_id"))
    private Set<Category> categories = new HashSet<>();
}

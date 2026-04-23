import {computed, inject, Injectable, Signal} from '@angular/core';
import {TeamsStore} from './team/teams.store';
import {StaffsStore} from './staff/staffs.store';
import {HallsStore} from './hall/halls.store';
import {SeasonsStore} from './season/seasons.store';
import {StaffCardViewModel, StaffMiniCardViewModel, StaffTeamViewModel} from './staff/staff.view-models';
import {Hall, Season, StaffRoleValue, Team} from '@shared-domain';
import {ImageService} from '../utils/image.service';
import {formatCategory, formatGender, formatStaffRole} from '../utils/formatters';
import {TeamCardViewModel, TeamMiniCardViewModel} from './team/team.view-models';
import {HallCardViewModel} from './hall/hall.view-models';
import {SeasonCardViewModel} from './season/season.view-models';

/**
 * Service dedicated to mapping domain objects and store states into ViewModels.
 * This avoids circular dependencies between Stores while keeping mapping logic centralized.
 */
@Injectable({
  providedIn: 'root'
})
export class ViewModelMapperService {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _hallsStore = inject(HallsStore);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _imageService = inject(ImageService);

  /**
   * Computed signal that maps all halls to their HallCardViewModel.
   */
  readonly hallCardViewModelsSignal: Signal<HallCardViewModel[]> = computed(() => {
    return this._hallsStore.hallsSignal().map(hall => this._mapToHallCardViewModel(hall));
  });

  /**
   * Returns a Signal for a specific HallCardViewModel by ID.
   */
  hallCardViewModelById(idSignal: Signal<string | undefined>): Signal<HallCardViewModel | undefined> {
    return computed(() => {
      const hall = this._hallsStore.hallById(idSignal)();
      return hall ? this._mapToHallCardViewModel(hall) : undefined;
    });
  }

  /**
   * Computed signal that maps all seasons to their SeasonCardViewModel.
   */
  readonly seasonCardViewModelsSignal: Signal<SeasonCardViewModel[]> = computed(() => {
    return this._seasonsStore.seasonsSignal().map(season => this._mapToSeasonCardViewModel(season));
  });

  /**
   * Returns a Signal for a specific SeasonCardViewModel by ID.
   */
  seasonCardViewModelById(idSignal: Signal<string | undefined>): Signal<SeasonCardViewModel | undefined> {
    return computed(() => {
      const season = this._seasonsStore.seasonById(idSignal)();
      return season ? this._mapToSeasonCardViewModel(season) : undefined;
    });
  }

  /**
   * Computed signal that maps all teams to their TeamCardViewModel.
   */
  readonly teamCardViewModelsSignal: Signal<TeamCardViewModel[]> = computed(() => {
    return this._teamsStore.teamsSignal().map(team => this._mapToTeamCardViewModel(team));
  });

  /**
   * Computed signal that maps all teams to their TeamMiniCardViewModel.
   */
  readonly teamMiniCardViewModelsSignal: Signal<TeamMiniCardViewModel[]> = computed(() => {
    return this._teamsStore.teamsSignal().map(team => this._mapToTeamMiniCardViewModel(team));
  });

  /**
   * Returns a Signal for a specific TeamCardViewModel by ID.
   */
  teamCardViewModelById(idSignal: Signal<string | undefined>): Signal<TeamCardViewModel | undefined> {
    return computed(() => {
      const teamId = idSignal();
      if (!teamId) return undefined;
      const team = this._teamsStore.teamsSignal().find(t => t.id === teamId);
      return team ? this._mapToTeamCardViewModel(team) : undefined;
    });
  }

  /**
   * Internal mapper to transform a Hall domain object into a HallCardViewModel.
   */
  private _mapToHallCardViewModel(hall: Hall): HallCardViewModel {
    const fullAddress = `${hall.addressStreet}, ${hall.addressPostalCode} ${hall.addressCity}, ${hall.addressCountry}`;
    const query = encodeURIComponent(fullAddress);

    return {
      id: hall.id,
      name: hall.name,
      addressStreet: hall.addressStreet,
      addressCityInfo: `${hall.addressPostalCode} ${hall.addressCity}`,
      addressCountry: hall.addressCountry,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
      googleMapsEmbedUrl: `https://www.google.com/maps?q=${query}&output=embed`
    };
  }

  /**
   * Internal mapper to transform a Season domain object into a SeasonCardViewModel.
   */
  private _mapToSeasonCardViewModel(season: Season): SeasonCardViewModel {
    return {
      id: season.id,
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
      isActive: season.isActive,
      isCurrent: season.isCurrent
    };
  }

  /**
   * Internal mapper to transform a Team domain object into a TeamCardViewModel.
   */
  private _mapToTeamCardViewModel(team: Team): TeamCardViewModel {
    const halls = this._hallsStore.hallsSignal();

    return {
      id: team.id,
      photoUrl: this._imageService.createImageSourceUrl(team.photoFileName),
      categoryLabelShort: formatCategory(team.ageGroup.ageLimit, team.ageGroup.upperLimit, 'short'),
      categoryLabelLong: formatCategory(team.ageGroup.ageLimit, team.ageGroup.upperLimit, 'long'),
      gender: team.gender,
      teamNumber: team.teamNumber,
      staffs: (team.staffs ?? []).map(staffView => {
        const staff = this._staffsStore.staffsSignal().find(s => s.id === staffView.staffId);
        return {
          id: staffView.staffId,
          fullName: staff ? `${staff.firstName} ${staff.lastName}` : 'Inconnu',
          roleLabel: formatStaffRole(staffView.role as StaffRoleValue),
          role: staffView.role as StaffRoleValue,
          avatarUrl: this._imageService.createImageSourceUrl(staff?.avatarFileName)
        };
      }),
      trainingSessions: (team.trainingSessions ?? []).map(session => {
        const hall = halls.find(h => h.id === session.hallId);
        return {
          dayOfWeek: session.dayOfWeek,
          startTime: session.timeSlot.startTime,
          endTime: session.timeSlot.endTime,
          hallName: hall ? hall.name : 'Salle inconnue',
          hallId: session.hallId
        };
      })
    };
  }

  /**
   * Internal mapper to transform a Team domain object into a TeamMiniCardViewModel.
   */
  private _mapToTeamMiniCardViewModel(team: Team): TeamMiniCardViewModel {
    const category = formatCategory(team.ageGroup.ageLimit, team.ageGroup.upperLimit, 'long');
    const teamNumber = team.teamNumber > 1 ? ` ${team.teamNumber}` : '';

    return {
      id: team.id,
      categoryAndNumberLabel: `${category}${teamNumber}`,
      genderLabel: formatGender(team.gender, 'long')
    };
  }

  /**
   * Returns a Signal for a StaffCardViewModel by ID and optional season filter.
   */
  staffCardViewModelById(staffIdSignal: Signal<string | undefined>, seasonIdSignal: Signal<string | undefined>): Signal<StaffCardViewModel | undefined> {
    return computed(() => {
      const staffId = staffIdSignal();
      if (!staffId) return undefined;

      const staff = this._staffsStore.staffsSignal().find(s => s.id === staffId);
      if (!staff) return undefined;

      const allTeams = this._teamsStore.teamsByStaffId(computed(() => staffId))();
      const seasons = this._seasonsStore.seasonsSignal();
      const targetSeasonId = seasonIdSignal();

      const filteredTeams = targetSeasonId
        ? allTeams.filter(t => t.seasonId === targetSeasonId)
        : allTeams;

      const assignedTeams: StaffTeamViewModel[] = filteredTeams.map(team => {
        const season = seasons.find(s => s.id === team.seasonId);
        return {
          id: team.id,
          seasonName: season ? season.name : '?',
          teamLabel: `${formatCategory(team.ageGroup.ageLimit, team.ageGroup.upperLimit, 'short')}${team.teamNumber > 1 ? ` ${team.teamNumber}` : ''}`,
          roleLabel: formatStaffRole(team.role as StaffRoleValue)
        };
      }).sort((a, b) => b.seasonName.localeCompare(a.seasonName));

      return {
        id: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        fullName: `${staff.firstName} ${staff.lastName}`,
        email: staff.email,
        phone: staff.phone,
        avatarUrl: this._imageService.createImageSourceUrl(staff.avatarFileName),
        assignedTeams
      };
    });
  }

  /**
   * Maps a technical staff assignment within a team to a StaffMiniCardViewModel.
   */
  mapToStaffMiniCardViewModel(staffId: string, role: StaffRoleValue): StaffMiniCardViewModel {
    const staff = this._staffsStore.staffsSignal().find(s => s.id === staffId);
    return {
      id: staffId,
      fullName: staff ? `${staff.firstName} ${staff.lastName}` : 'Inconnu',
      roleLabel: formatStaffRole(role),
      avatarUrl: this._imageService.createImageSourceUrl(staff?.avatarFileName)
    };
  }
}

import {Routes} from '@angular/router';
import {Contact, Error404, MentionsLegales, Rgpd} from '@shared-ui'
import {HallsList} from './feature/hall/components/halls-list/halls-list';
import {HallForm} from './feature/hall/components/hall-form/hall-form';
import {HallView} from './feature/hall/components/hall-view/hall-view';
import {SeasonsList} from './feature/season/components/seasons-list/seasons-list';
import {SeasonForm} from './feature/season/components/season-form/season-form';
import {SeasonView} from './feature/season/components/season-view/season-view';
import {StaffsList} from './feature/staff/components/staffs-list/staffs-list';
import {StaffForm} from './feature/staff/components/staff-form/staff-form';
import {StaffView} from './feature/staff/components/staff-view/staff-view';
import {TeamsList} from './feature/team/components/teams-list/teams-list';
import {TeamForm} from './feature/team/components/team-form/team-form';
import {TeamView} from './feature/team/components/team-view/team-view';
import {AgeGroupList} from './feature/team/components/age-group-list/age-group-list';
import {AgeGroupForm} from './feature/team/components/age-group-form/age-group-form';
import {Dashboard} from "./feature/dashboard/dashboard";
import {authGuard} from './core/guards/auth-guard';

// noinspection SpellCheckingInspection
export const routes: Routes = [
  {path: '', component: Dashboard, pathMatch: 'full'},
  {
    path: 'halls',
    canActivateChild: [authGuard],
    children: [
      {path: '', component: HallsList},       // /halls
      {path: 'create', component: HallForm},
      {path: ':id/update', component: HallForm},
      {path: ':id', component: HallView},
    ]
  },
  {
    path: 'seasons',
    canActivateChild: [authGuard],
    children: [
      {path: '', component: SeasonsList},       // /halls
      {path: 'create', component: SeasonForm},
      {path: ':id/update', component: SeasonForm},
      {path: ':id', component: SeasonView},
    ]
  },
  {
    path: 'staffs',
    canActivateChild: [authGuard],
    children: [
      {path: '', component: StaffsList},
      {path: 'create', component: StaffForm},
      {path: ':id/update', component: StaffForm},
      {path: ':id', component: StaffView},
    ]
  },
  {
    path: 'teams',
    canActivateChild: [authGuard],
    children: [
      {path: '', component: TeamsList},
      {path: 'create', component: TeamForm},
      {path: ':id/update', component: TeamForm},
      {path: ':id', component: TeamView},
    ]
  },
  {
    path: 'age-groups',
    canActivateChild: [authGuard],
    children: [
      {path: '', component: AgeGroupList},
      {path: 'create', component: AgeGroupForm},
    ]
  },
  {path: 'mentions-legales', component: MentionsLegales},
  {path: 'contact', component: Contact},
  {path: 'rgpd', component: Rgpd},
  {path: '404', component: Error404},
  {path: '**', redirectTo: '404'},
];

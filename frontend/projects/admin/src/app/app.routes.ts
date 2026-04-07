import {Routes} from '@angular/router';
import {Contact, Error404, MentionsLegales, Rgpd} from '@shared-ui'
import {authGuard} from './core/guards/auth-guard';

// noinspection SpellCheckingInspection
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature/dashboard/dashboard').then(m => m.Dashboard),
    pathMatch: 'full'
  },
  {
    path: 'halls',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/hall/components/halls-list/halls-list').then(m => m.HallsList)
      },
      {
        path: 'create',
        loadComponent: () => import('./feature/hall/components/hall-form/hall-form').then(m => m.HallForm)
      },
      {
        path: ':id/update',
        loadComponent: () => import('./feature/hall/components/hall-form/hall-form').then(m => m.HallForm)
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/hall/components/hall-view/hall-view').then(m => m.HallView)
      },
    ]
  },
  {
    path: 'seasons',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/season/components/seasons-list/seasons-list').then(m => m.SeasonsList)
      },
      {
        path: 'create',
        loadComponent: () => import('./feature/season/components/season-form/season-form').then(m => m.SeasonForm)
      },
      {
        path: ':id/update',
        loadComponent: () => import('./feature/season/components/season-form/season-form').then(m => m.SeasonForm)
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/season/components/season-view/season-view').then(m => m.SeasonView)
      },
    ]
  },
  {
    path: 'staffs',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/staff/components/staffs-list/staffs-list').then(m => m.StaffsList)
      },
      {
        path: 'create',
        loadComponent: () => import('./feature/staff/components/staff-form/staff-form').then(m => m.StaffForm)
      },
      {
        path: ':id/update',
        loadComponent: () => import('./feature/staff/components/staff-form/staff-form').then(m => m.StaffForm)
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/staff/components/staff-view/staff-view').then(m => m.StaffView)
      },
    ]
  },
  {
    path: 'teams',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/team/components/teams-list/teams-list').then(m => m.TeamsList)
      },
      {
        path: 'create',
        loadComponent: () => import('./feature/team/components/team-form/team-form').then(m => m.TeamForm)
      },
      {
        path: ':id/update',
        loadComponent: () => import('./feature/team/components/team-form/team-form').then(m => m.TeamForm)
      },
      {
        path: ':id',
        loadComponent: () => import('./feature/team/components/team-view/team-view').then(m => m.TeamView)
      },
    ]
  },
  {
    path: 'age-groups',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./feature/team/components/age-group-list/age-group-list').then(m => m.AgeGroupList)
      },
      {
        path: 'create',
        loadComponent: () => import('./feature/team/components/age-group-form/age-group-form').then(m => m.AgeGroupForm)
      },
    ]
  },
  {path: 'mentions-legales', component: MentionsLegales},
  {path: 'contact', component: Contact},
  {path: 'rgpd', component: Rgpd},
  {path: '404', component: Error404},
  {path: '**', redirectTo: '404'},
];

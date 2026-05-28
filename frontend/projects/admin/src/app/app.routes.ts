import {Routes} from '@angular/router';
import {Error404, MentionsLegales, Rgpd} from '@shared-ui'
import {authGuard} from './core/guards/auth-guard';

// noinspection SpellCheckingInspection
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    pathMatch: 'full'
  },
  {
    path: 'halls',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/hall/components/halls-list/halls-list').then(m => m.HallsList)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/hall/components/hall-form/hall-form').then(m => m.HallForm)
      },
      {
        path: ':id/update',
        loadComponent: () => import('./features/hall/components/hall-form/hall-form').then(m => m.HallForm)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/hall/components/hall-view/hall-view').then(m => m.HallView)
      },
    ]
  },
  {
    path: 'seasons',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/season/components/seasons-list/seasons-list').then(m => m.SeasonsList)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/season/components/season-form/season-form').then(m => m.SeasonForm)
      },
      {
        path: ':id/update',
        loadComponent: () => import('./features/season/components/season-form/season-form').then(m => m.SeasonForm)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/season/components/season-view/season-view').then(m => m.SeasonView)
      },
    ]
  },
  {
    path: 'staffs',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/staff/components/staffs-list/staffs-list').then(m => m.StaffsList)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/staff/components/staff-form/staff-form').then(m => m.StaffForm)
      },
      {
        path: ':id/update',
        loadComponent: () => import('./features/staff/components/staff-form/staff-form').then(m => m.StaffForm)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/staff/components/staff-view/staff-view').then(m => m.StaffView)
      },
    ]
  },
  {
    path: 'teams',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/team/components/teams-list/teams-list').then(m => m.TeamsList)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/team/components/team-form/team-form').then(m => m.TeamForm)
      },
      {
        path: ':id/update',
        loadComponent: () => import('./features/team/components/team-form/team-form').then(m => m.TeamForm)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/team/components/team-view/team-view').then(m => m.TeamView)
      },
    ]
  },
  {
    path: 'age-groups',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/team/components/age-group-list/age-group-list').then(m => m.AgeGroupList)
      },
      {
        path: 'create',
        loadComponent: () => import('./features/team/components/age-group-form/age-group-form').then(m => m.AgeGroupForm)
      },
    ]
  },
  {
    path: 'membership',
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/membership/components/campaigns-list/campaigns-list').then(m => m.CampaignsList)
      },
      {
        path: 'campaign/create',
        loadComponent: () => import('./features/membership/components/campaign-form/campaign-form').then(m => m.CampaignForm)
      },
      {
        path: 'campaign/:id/update',
        loadComponent: () => import('./features/membership/components/campaign-form/campaign-form').then(m => m.CampaignForm)
      },
      {
        path: 'campaign/:id',
        loadComponent: () => import('./features/membership/components/campaign-view/campaign-view').then(m => m.CampaignView)
      },
    ]
  },
  {path: 'mentions-legales', component: MentionsLegales},
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/components/contact-view/contact-view').then(m => m.ContactView)
  },
  {path: 'rgpd', component: Rgpd},
  {path: '404', component: Error404},
  {path: '**', redirectTo: '404'},
];

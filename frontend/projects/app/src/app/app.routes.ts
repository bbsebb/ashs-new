import {Routes} from '@angular/router';
import {Contact, Error404, MentionsLegales, Rgpd} from '@shared-ui';

export const routes: Routes = [
  {path: '', redirectTo: 'feeds', pathMatch: 'full'},
  {
    path: 'halls',
    loadComponent: () => import('./features/hall/components/halls-list/halls-list').then(m => m.HallsList)
  },
  {
    path: 'teams',
    loadComponent: () => import('./features/team/components/teams-list/teams-list').then(m => m.TeamsList)
  },
  {
    path: 'staffs',
    loadComponent: () => import('./features/staff/components/staffs-list/staffs-list').then(m => m.StaffsList)
  },
  {
    path: 'feeds',
    loadComponent: () => import('./features/meta/components/feeds-list/feeds-list').then(m => m.FeedsList)
  },
  {path: 'mentions-legales', component: MentionsLegales},
  {path: 'contact', component: Contact},
  {path: 'rgpd', component: Rgpd},
  {path: '**', component: Error404},
];

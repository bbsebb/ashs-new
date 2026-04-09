import {Routes} from '@angular/router';
import {Contact, Error404, MentionsLegales, Rgpd} from '@shared-ui';

export const routes: Routes = [
  {path: '', redirectTo: 'feeds', pathMatch: 'full'},
  {
    path: 'halls',
    title: 'Nos Salles',
    loadComponent: () => import('./features/hall/components/halls-list/halls-list').then(m => m.HallsList)
  },
  {
    path: 'teams',
    title: 'Nos Équipes',
    loadComponent: () => import('./features/team/components/teams-list/teams-list').then(m => m.TeamsList)
  },
  {
    path: 'staffs',
    title: 'Notre Staff',
    loadComponent: () => import('./features/staff/components/staffs-list/staffs-list').then(m => m.StaffsList)
  },
  {
    path: 'feeds',
    title: 'Actualités',
    loadComponent: () => import('./features/meta/components/feeds-list/feeds-list').then(m => m.FeedsList)
  },
  {path: 'mentions-legales', title: 'Mentions Légales', component: MentionsLegales},
  {path: 'contact', title: 'Contact', component: Contact},
  {path: 'rgpd', title: 'RGPD', component: Rgpd},
  {path: '**', title: 'Page non trouvée', component: Error404},
];

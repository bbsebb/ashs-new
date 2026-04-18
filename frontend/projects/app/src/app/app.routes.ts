import {Routes} from '@angular/router';
import {Contact, Error404, MentionsLegales, Rgpd} from '@shared-ui';

export const routes: Routes = [
  {path: '', redirectTo: 'feeds', pathMatch: 'full'},
  {
    path: 'halls',
    title: 'Nos Salles',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/hall/components/halls-list/halls-list').then(m => m.HallsList)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/hall/components/hall-view/hall-view').then(m => m.HallView)
      },
    ]
  },
  {
    path: 'teams',
    title: 'Nos Équipes',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/team/components/teams-list/teams-list').then(m => m.TeamsList)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/team/components/team-view/team-view').then(m => m.TeamView)
      },
    ]
  },
  {
    path: 'staffs',
    title: 'Notre Staff',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/staff/components/staffs-list/staffs-list').then(m => m.StaffsList)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/staff/components/staff-view/staff-view').then(m => m.StaffView)
      },
    ]

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

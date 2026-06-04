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
  {
    path: 'membership/register',
    title: 'Adhésion en ligne',
    loadComponent: () => import('./features/membership/components/membership-registration/membership-registration').then(m => m.MembershipRegistrationComponent)
  },
  {
    path: 'membership/payment/return/:id',
    title: 'Retour de paiement',
    loadComponent: () => import('./features/membership/components/payment-return/payment-return').then(m => m.PaymentReturnComponent)
  },
  {
    path: 'contact',
    title: 'Contact',
    loadComponent: () => import('./features/contact/components/contact-view/contact-view').then(m => m.ContactView)
  },
  {path: 'rgpd', title: 'RGPD', component: Rgpd},
  {path: '**', title: 'Page non trouvée', component: Error404},
];

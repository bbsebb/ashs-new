import { Routes } from '@angular/router';
import {FeedsList} from './features/meta/components/feeds-list/feeds-list';
import {MentionsLegales, Rgpd, Error404} from '@shared-ui';

export const routes: Routes = [
  { path: '', redirectTo: 'feeds', pathMatch: 'full' },
  { path: 'feeds', component: FeedsList },
  {path: 'mentions-legales', component: MentionsLegales},
  {path: 'rgpd', component: Rgpd},
  { path: '**', component: Error404 },
];

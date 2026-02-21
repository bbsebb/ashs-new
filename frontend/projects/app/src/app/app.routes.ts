import {Routes} from '@angular/router';
import {FeedsList} from './features/meta/components/feeds-list/feeds-list';
import {Contact, Error404, MentionsLegales, Rgpd} from '@shared-ui';
import {HallsList} from './features/hall/components/halls-list/halls-list';

export const routes: Routes = [
  {path: '', redirectTo: 'feeds', pathMatch: 'full'},
  {path: 'halls', component: HallsList},
  {path: 'feeds', component: FeedsList},
  {path: 'mentions-legales', component: MentionsLegales},
  {path: 'contact', component: Contact},
  {path: 'rgpd', component: Rgpd},
  {path: '**', component: Error404},
];

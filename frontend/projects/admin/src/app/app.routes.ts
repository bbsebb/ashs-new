import { Routes } from '@angular/router';
import {MentionsLegales, Rgpd} from '@shared-ui'
import {Error404} from '@shared-ui';
import {HallsList} from './feature/hall/components/halls-list/halls-list';
import {HallForm} from './feature/hall/components/hall-form/hall-form';
import {HallView} from './feature/hall/components/hall-view/hall-view';

export const routes: Routes = [
  {path: '', redirectTo: 'halls', pathMatch: 'full'},
  {path: 'halls',
  children : [
    { path: '', component: HallsList },       // /halls
    { path: 'create', component: HallForm },
    { path: ':id/edit', component: HallForm },
    { path: ':id', component: HallView },
  ]},
  {path: 'mentions-legales', component: MentionsLegales},
  {path: 'rgpd', component: Rgpd},
  {path: '404', component: Error404},
];

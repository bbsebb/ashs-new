import {Routes} from '@angular/router';
import {Contact, Error404, MentionsLegales, Rgpd} from '@shared-ui'
import {HallsList} from './feature/hall/components/halls-list/halls-list';
import {HallForm} from './feature/hall/components/hall-form/hall-form';
import {HallView} from './feature/hall/components/hall-view/hall-view';
import {SeasonsList} from './feature/season/components/seasons-list/seasons-list';
import {SeasonForm} from './feature/season/components/season-form/season-form';
import {SeasonView} from './feature/season/components/season-view/season-view';
import {ImageCropper} from './shared/image-cropper/image-cropper';

export const routes: Routes = [
  {path: '', redirectTo: 'halls', pathMatch: 'full'},
  {path: 'image', component: ImageCropper},
  {
    path: 'halls',
    children: [
      {path: '', component: HallsList},       // /halls
      {path: 'create', component: HallForm},
      {path: ':id/edit', component: HallForm},
      {path: ':id', component: HallView},
    ]
  },
  {
    path: 'seasons',
    children: [
      {path: '', component: SeasonsList},       // /halls
      {path: 'create', component: SeasonForm},
      {path: ':id/edit', component: SeasonForm},
      {path: ':id', component: SeasonView},
    ]
  },
  {path: 'mentions-legales', component: MentionsLegales},
  {path: 'contact', component: Contact},
  {path: 'rgpd', component: Rgpd},
  {path: '404', component: Error404},
  {path: '**', redirectTo: '404'},
];

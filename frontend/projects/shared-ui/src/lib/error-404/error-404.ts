import {Component, input} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ButtonBackHomeDirective} from '../button-back-home/button-back-home-directive';

@Component({
  selector: 'app-error-404',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, ButtonBackHomeDirective],
  templateUrl: './error-404.html',
  styleUrl: './error-404.scss',
})
export class Error404 {
  titleInputSignal = input<string, string | undefined>('Page introuvable', {
    alias: 'title',
    transform: (v: string | undefined) => v ?? 'Page introuvable'
  });
  messageInputSignal = input<string, string | undefined>('La page que vous cherchez n\'existe pas ou a ete deplacee.', {
    alias: 'message',
    transform: (v: string | undefined) => v ?? 'La page que vous cherchez n\'existe pas ou a ete deplacee.'
  });
  homeLabelInputSignal = input<string, string | undefined>("Retour a l'accueil", {
    alias: 'homeLabel',
    transform: (v: string | undefined) => v ?? 'Retour a l\'accueil'
  });
  homeRouteInputSignal = input<string, string | undefined>('/', {
    alias: 'homeRoute',
    transform: (v: string | undefined) => v ?? '/'
  });
}

import {Component, input} from '@angular/core';

@Component({
  selector: 'app-page-title',
  imports: [],
  templateUrl: './page-title.html',
  styleUrl: './page-title.scss',
})
export class PageTitle {
  eyebrow = input<string | null>(null);
  title = input<string>('Titre');       // requis “logiquement”
  subtitle = input<string | null>(null);
}

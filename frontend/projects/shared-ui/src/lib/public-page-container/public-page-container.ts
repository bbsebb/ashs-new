import {Component, input} from '@angular/core';
import {PageTitle} from '../page-title/page-title';

@Component({
  selector: 'app-public-page-container',
  imports: [PageTitle],
  templateUrl: './public-page-container.html',
  styleUrl: './public-page-container.scss',
})
export class PublicPageContainer {
  title = input.required<string>();
  subtitle = input<string>('');
  eyebrow = input<string>('');
}

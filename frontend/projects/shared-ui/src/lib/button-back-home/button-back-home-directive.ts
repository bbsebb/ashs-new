import {Directive, inject, input} from '@angular/core';
import {Router, RouterLink} from '@angular/router';

@Directive({
  selector: 'button[back-home]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
    '[textContent]': 'label()',
  }
})
export class ButtonBackHomeDirective {
  private router = inject(Router);
  route = input<string | any[]>('/');
  label = input<string>('Retour');

  onClick(): void {
    const r = this.route();
    if (Array.isArray(r)) {
      void this.router.navigate(r);
    } else {
      void this.router.navigateByUrl(r);
    }
  }
}

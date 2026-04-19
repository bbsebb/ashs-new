import {Directive, inject, input} from '@angular/core';
import {Router} from '@angular/router';

/**
 * Directive applicable to buttons to provide a standard "Back" navigation behavior.
 * Programmatically navigates to a specified route using the Angular Router.
 */
@Directive({
  selector: 'button[back-home]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
    '[textContent]': 'labelInputSignal()',
  }
})
export class ButtonBackHomeDirective {
  private router = inject(Router);

  /** The target route to navigate to. Defaults to root ('/'). */
  routeInputSignal = input<string | any[]>('/', {alias: 'route'});
  /** The text label to display on the button. Defaults to 'Retour'. */
  labelInputSignal = input<string>('Retour', {alias: 'label'});

  /** Triggered on button click. Performs the actual navigation. */
  onClick(): void {
    const r = this.routeInputSignal();
    if (Array.isArray(r)) {
      void this.router.navigate(r);
    } else {
      void this.router.navigateByUrl(r);
    }
  }
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { render, screen, fireEvent } from '@testing-library/angular';
import { describe, it, expect, vi } from 'vitest';
import { ButtonBackHomeDirective } from './button-back-home-directive';

@Component({
  standalone: true,
  imports: [ButtonBackHomeDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<button back-home [route]="route" [label]="label"></button>`
})
class TestHostComponent {
  route: string | any[] = '/';
  label = 'Retour';
}

describe('ButtonBackHomeDirective', () => {
  it('should render the default label', async () => {
    await render(TestHostComponent, {
      providers: [provideRouter([])]
    });

    const button = screen.getByRole('button');
    expect(button.textContent).toBe('Retour');
  });

  it('should update the label when input changes', async () => {
    const { rerender } = await render(TestHostComponent, {
      providers: [provideRouter([])],
      componentProperties: {
        label: 'Go Back'
      }
    });

    const button = screen.getByRole('button');
    expect(button.textContent).toBe('Go Back');

    await rerender({ componentProperties: { label: 'New Label' } });
    expect(button.textContent).toBe('New Label');
  });

  it('should navigate by URL when route is a string', async () => {
    const { fixture } = await render(TestHostComponent, {
      providers: [provideRouter([])],
      componentProperties: {
        route: '/home'
      }
    });

    const router = fixture.debugElement.injector.get(Router);
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl');

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/home');
  });

  it('should navigate by commands when route is an array', async () => {
    const { fixture } = await render(TestHostComponent, {
      providers: [provideRouter([])],
      componentProperties: {
        route: ['/user', 1]
      }
    });

    const router = fixture.debugElement.injector.get(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(navigateSpy).toHaveBeenCalledWith(['/user', 1]);
  });

  it('should use default route "/" if none provided', async () => {
    @Component({
      standalone: true,
      imports: [ButtonBackHomeDirective],
      template: `<button back-home></button>`
    })
    class DefaultHostComponent {}

    const { fixture } = await render(DefaultHostComponent, {
      providers: [provideRouter([])]
    });

    const router = fixture.debugElement.injector.get(Router);
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl');

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/');
  });
});

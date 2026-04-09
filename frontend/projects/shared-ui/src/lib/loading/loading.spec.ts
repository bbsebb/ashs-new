import { render, screen } from '@testing-library/angular';
import { LoadingComponent } from './loading';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { describe, expect, it } from 'vitest';

describe('LoadingComponent', () => {
  it('should display default message', async () => {
    await render(LoadingComponent, { imports: [MatProgressSpinnerModule] });
    expect(screen.getByText('Chargement...')).toBeTruthy();
  });

  it('should display custom message', async () => {
    await render(LoadingComponent, {
      inputs: { message: 'Patientez svp' },
      imports: [MatProgressSpinnerModule]
    });
    expect(screen.getByText('Patientez svp')).toBeTruthy();
  });
});

import { render } from '@testing-library/angular';
import { Notification } from './notification';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { vi, describe, expect, it } from 'vitest';

describe('Notification Component', () => {
  it('should display data message', async () => {
    const { getByText } = await render(Notification, {
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: 'Test Message' },
        { provide: MatSnackBarRef, useValue: { dismissWithAction: vi.fn() } }
      ]
    });
    expect(getByText('Test Message')).toBeTruthy();
  });
});

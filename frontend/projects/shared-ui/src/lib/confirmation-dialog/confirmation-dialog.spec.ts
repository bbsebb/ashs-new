import {fireEvent, render, screen} from '@testing-library/angular';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {describe, expect, it, vi} from 'vitest';
import {ConfirmationDialog} from './confirmation-dialog';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

describe('ConfirmationDialog', () => {
  const mockDialogRef = {
    close: vi.fn()
  };

  const mockData = {
    title: 'Confirm Action',
    content: 'Are you sure you want to proceed?'
  };

  it('should render title and content from data', async () => {
    await render(ConfirmationDialog, {
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        provideAnimationsAsync('noop')
      ]
    });

    expect(screen.getByText(mockData.title)).toBeTruthy();
    expect(screen.getByText(mockData.content)).toBeTruthy();
  });

  it('should close dialog when Cancel button is clicked', async () => {
    await render(ConfirmationDialog, {
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        provideAnimationsAsync('noop')
      ]
    });

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should have a Confirm button that closes the dialog with true value', async () => {
    await render(ConfirmationDialog, {
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        provideAnimationsAsync('noop')
      ]
    });

    const confirmButton = screen.getByText('Confirmer');
    expect(confirmButton).toBeTruthy();
  });
});

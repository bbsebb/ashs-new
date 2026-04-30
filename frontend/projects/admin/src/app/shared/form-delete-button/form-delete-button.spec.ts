import {render, screen, fireEvent} from '@testing-library/angular';
import {FormDeleteButton} from './form-delete-button';
import {DialogService} from '@shared-ui';
import {of} from 'rxjs';
import {describe, it, expect, vi} from 'vitest';
import {MatButtonHarness} from '@angular/material/button/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

/**
 * Unit tests for FormDeleteButton component.
 * Verifies the deletion workflow and integration with the confirmation dialog.
 */
describe('FormDeleteButton', () => {
  const mockDialogService = {
    showConfirmation: vi.fn()
  };

  it('should render correctly with default text', async () => {
    await render(FormDeleteButton, {
      providers: [{provide: DialogService, useValue: mockDialogService}]
    });
    expect(screen.getByText(/Supprimer/i)).toBeTruthy();
  });

  it('should render icon-only button when iconOnlySignal is true', async () => {
    await render(FormDeleteButton, {
      componentInputs: {iconOnly: true},
      providers: [{provide: DialogService, useValue: mockDialogService}]
    });
    // Text "Supprimer" should not be there
    expect(screen.queryByText(/Supprimer/i)).toBeNull();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should emit deleteConfirmed after user confirmation', async () => {
    mockDialogService.showConfirmation.mockReturnValue(of(true));
    const deleteConfirmedSpy = vi.fn();

    const {fixture} = await render(FormDeleteButton, {
      componentOutputs: {
        deleteConfirmed: {emit: deleteConfirmedSpy} as any
      },
      providers: [{provide: DialogService, useValue: mockDialogService}]
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockDialogService.showConfirmation).toHaveBeenCalled();
    expect(deleteConfirmedSpy).toHaveBeenCalled();
  });

  it('should NOT emit deleteConfirmed if user cancels', async () => {
    mockDialogService.showConfirmation.mockReturnValue(of(false));
    const deleteConfirmedSpy = vi.fn();

    await render(FormDeleteButton, {
      componentOutputs: {
        deleteConfirmed: {emit: deleteConfirmedSpy} as any
      },
      providers: [{provide: DialogService, useValue: mockDialogService}]
    });

    fireEvent.click(screen.getByRole('button'));
    expect(deleteConfirmedSpy).not.toHaveBeenCalled();
  });

  it('should be disabled when disabledSignal is true', async () => {
    const {fixture} = await render(FormDeleteButton, {
      componentInputs: {disabled: true},
      providers: [{provide: DialogService, useValue: mockDialogService}]
    });

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const buttonHarness = await loader.getHarness(MatButtonHarness);

    expect(await buttonHarness.isDisabled()).toBe(true);
  });
});

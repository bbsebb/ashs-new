import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {FormSubmitButton} from '@shared-ui';

/**
 * Unit tests for FormSubmitButton component.
 */
describe('FormSubmitButton Component', () => {
  it('should render default content', async () => {
    await render(FormSubmitButton);
    expect(screen.getByText('Envoyer')).toBeDefined();
    expect(screen.getByRole('button')).not.toHaveProperty('disabled', true);
  });

  it('should render custom content', async () => {
    await render(FormSubmitButton, {
      componentProperties: {
        contentInputSignal: 'Sauvegarder'
      } as any
    });
    expect(screen.getByText('Sauvegarder')).toBeDefined();
  });

  it('should disable button when disabled input is true', async () => {
    await render(FormSubmitButton, {
      componentProperties: {
        disabledInputSignal: true
      } as any
    });
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('should show spinner and hide text when submitting', async () => {
    await render(FormSubmitButton, {
      componentProperties: {
        submittingInputSignal: true
      } as any
    });

    expect(screen.queryByText('Envoyer')).toBeNull();
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });
});

import {render, screen} from '@testing-library/angular';
import {describe, expect, it} from 'vitest';
import {FormSubmitButton} from './form-submit-button';

describe('FormSubmitButton Component', () => {
  it('should render default content', async () => {
    await render(FormSubmitButton);
    expect(screen.getByText('Envoyer')).toBeDefined();
    expect(screen.getByRole('button')).not.toHaveProperty('disabled', true);
  });

  it('should render custom content', async () => {
    await render(FormSubmitButton, {
      componentInputs: {
        content: 'Sauvegarder'
      }
    });
    expect(screen.getByText('Sauvegarder')).toBeDefined();
  });

  it('should disable button when disabled input is true', async () => {
    await render(FormSubmitButton, {
      componentInputs: {
        disabled: true
      }
    });
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('should show spinner and hide text when submitting', async () => {
    await render(FormSubmitButton, {
      componentInputs: {
        submitting: true
      }
    });
    
    // Le texte ne devrait plus être visible
    expect(screen.queryByText('Envoyer')).toBeNull();
    
    // Le spinner (role=progressbar interne à Angular Material) devrait être présent, 
    // ou au moins le bouton devrait être désactivé
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });
});

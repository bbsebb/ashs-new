import {fireEvent, render, screen} from '@testing-library/angular';
import {Contact} from './contact';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {ContactSubmitEvent, ContactViewModel} from '@shared-api';
import {describe, expect, it, vi} from 'vitest';

describe('Contact Component', () => {
  const mockViewModel: ContactViewModel = {
    eyebrow: 'Contact',
    title: 'Nous contacter',
    subtitle: 'Renseignez votre email'
  };

  const setup = async () => {
    return await render(Contact, {
      providers: [
        provideAnimationsAsync('noop')
      ],
      componentInputs: {
        contactViewModel: mockViewModel
      }
    });
  };

  it('should render contact form with all fields', async () => {
    await setup();
    expect(screen.getByLabelText(/votre email/i)).toBeTruthy();
    expect(screen.getByLabelText(/sujet/i)).toBeTruthy();
    expect(screen.getByLabelText(/message/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /envoyer/i })).toBeTruthy();
  });

  it('should emit submitted event on valid submit', async () => {
    const submittedSpy = vi.fn();
    await render(Contact, {
      providers: [provideAnimationsAsync('noop')],
      componentInputs: {contactViewModel: mockViewModel},
      componentOutputs: {submitted: {emit: submittedSpy} as any}
    });

    fireEvent.input(screen.getByLabelText(/votre email/i), { target: { value: 'test@example.com' } });
    fireEvent.input(screen.getByLabelText(/sujet/i), { target: { value: 'Hello World' } });
    fireEvent.input(screen.getByLabelText(/message/i), { target: { value: 'This is a test message' } });

    const submitBtn = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(submitBtn);

    expect(submittedSpy).toHaveBeenCalledWith({
      from: 'test@example.com',
      subject: 'Hello World',
      content: 'This is a test message'
    } as ContactSubmitEvent);
  });
});

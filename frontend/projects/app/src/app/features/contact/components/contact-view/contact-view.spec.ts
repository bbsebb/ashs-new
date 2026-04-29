import {fireEvent, render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {ContactView} from './contact-view';
import {HttpClient} from '@angular/common/http';
import {APP_CONFIG} from '@shared-api';
import {of} from 'rxjs';

/**
 * Unit tests for ContactView (Smart Component).
 */
describe('ContactView Component', () => {
  it('should render the contact form and handle submission', async () => {
    const mockHttpClient = {
      post: vi.fn().mockReturnValue(of({}))
    };
    const mockAppConfig = {apiUrl: 'http://api.test'};

    await render(ContactView, {
      providers: [
        {provide: HttpClient, useValue: mockHttpClient},
        {provide: APP_CONFIG, useValue: mockAppConfig}
      ]
    });

    // Check if the title from ViewModel is rendered
    expect(screen.getByText(/Une question/i)).toBeDefined();

    // Fill form and submit
    const emailInput = screen.getByLabelText(/Email/i);
    const subjectInput = screen.getByLabelText(/Sujet/i);
    const messageInput = screen.getByLabelText(/Message/i);
    const submitButton = screen.getByRole('button', {name: /Envoyer/i});

    fireEvent.input(emailInput, {target: {value: 'test@example.com'}});
    fireEvent.input(subjectInput, {target: {value: 'Test Subject'}});
    fireEvent.input(messageInput, {target: {value: 'Test Message content'}});

    fireEvent.click(submitButton);

    // Verify HttpClient was called
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      'http://api.test/api/v1/contact/send',
      {
        from: 'test@example.com',
        subject: 'Test Subject',
        content: 'Test Message content'
      }
    );
  });
});

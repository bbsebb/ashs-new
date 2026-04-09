import { render, screen, fireEvent } from '@testing-library/angular';
import { Contact } from './contact';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_CONFIG, ContactGateway, FormErrorHandleService } from '@shared-api';
import { NotificationService } from '../notification/notification-service';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect } from 'vitest';

describe('Contact Component', () => {
  const mockContactGateway = {
    contactSubmission: vi.fn()
  };
  const mockNotificationService = {
    show: vi.fn()
  };

  const setup = async () => {
    return await render(Contact, {
      providers: [
        provideAnimationsAsync('noop'),
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api', uploadsPath: '/uploads' } },
        { provide: ContactGateway, useValue: mockContactGateway },
        { provide: NotificationService, useValue: mockNotificationService },
        FormErrorHandleService
      ]
    });
  };

  it('should render contact form with all fields', async () => {
    await setup();
    expect(screen.getByLabelText(/votre email/i)).toBeTruthy();
    expect(screen.getByLabelText(/sujet/i)).toBeTruthy();
    expect(screen.getByLabelText(/message/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /envoyer/i })).toBeTruthy();
  });

  it('should call contactGateway on valid submit', async () => {
    mockContactGateway.contactSubmission.mockReturnValue(of(void 0));
    await setup();

    fireEvent.input(screen.getByLabelText(/votre email/i), { target: { value: 'test@example.com' } });
    fireEvent.input(screen.getByLabelText(/sujet/i), { target: { value: 'Hello World' } });
    fireEvent.input(screen.getByLabelText(/message/i), { target: { value: 'This is a test message' } });

    const submitBtn = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(submitBtn);

    expect(mockContactGateway.contactSubmission).toHaveBeenCalledWith(
      'test@example.com',
      'Hello World',
      'This is a test message'
    );
  });
});

import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {StaffsList} from './staffs-list';
import {StaffsStore, APP_CONFIG} from '@shared-api';
import {signal} from '@angular/core';

describe('StaffsList Component (Public)', () => {
  it('should render public staff grid', async () => {
    const mockStaffs = [{ id: 's1', firstName: 'Jean', lastName: 'Dupont', avatarFileName: null }];
    const mockStaffsStore = {
      staffsSignal: signal(mockStaffs),
      isLoadingSignal: signal(false),
      errorSignal: signal(null),
      reload: vi.fn()
    };

    await render(StaffsList, {
      providers: [
        { provide: StaffsStore, useValue: mockStaffsStore },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test.api' } }
      ]
    });

    expect(screen.getByText('Notre Staff')).toBeDefined();
    expect(screen.getByText('Jean Dupont')).toBeDefined();
  });
});

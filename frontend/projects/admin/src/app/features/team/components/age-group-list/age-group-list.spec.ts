import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {AgeGroupList} from './age-group-list';
import {AgeGroupStore} from '@shared-api';
import {signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {NotificationService} from '@shared-ui';
import {of} from 'rxjs';

describe('AgeGroupList Component (Admin)', () => {
  const mockAgeGroups = [
    { id: '1', name: 'U18', ageLimit: 18, upperLimit: true },
    { id: '2', name: 'Seniors', ageLimit: 18, upperLimit: false }
  ];

  const setupMocks = () => {
    return {
      ageGroupStore: {
        ageGroupsSignal: signal(mockAgeGroups),
        isLoadingSignal: signal(false),
        errorSignal: signal(null),
        deleteById: vi.fn().mockReturnValue(of(void 0)),
        reload: vi.fn()
      },
      notificationService: {
        show: vi.fn()
      }
    };
  };

  it('should render table with age groups data', async () => {
    const mocks = setupMocks();
    await render(AgeGroupList, {
      providers: [
        { provide: AgeGroupStore, useValue: mocks.ageGroupStore },
        { provide: NotificationService, useValue: mocks.notificationService },
        provideRouter([])
      ]
    });

    expect(screen.getByText('U18')).toBeDefined();
    expect(screen.getByText('Seniors')).toBeDefined();
  });
});

import {render, screen} from '@testing-library/angular';
import {describe, expect, it, vi} from 'vitest';
import {SeasonsList} from './seasons-list';
import {LayoutService, SeasonsStore} from '@shared-api';
import {NotificationService} from '@shared-ui';
import {signal} from '@angular/core';
import {of} from 'rxjs';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatTableHarness} from '@angular/material/table/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute} from '@angular/router';

describe('SeasonsList Component', () => {
  const setupMocks = (seasons: any[] = []) => {
    return {
      seasonsStore: {
        seasonsSignal: signal(seasons),
        isLoadingSignal: signal(false),
        errorSignal: signal<Error | null>(null),
        reload: vi.fn(),
        deleteById: vi.fn().mockReturnValue(of(void 0))
      },
      layoutService: {
        isDesktopSignal: signal(true)
      },
      notificationService: {
        show: vi.fn()
      }
    };
  };

  it('should render the seasons table', async () => {
    const seasons = [
      {id: '1', name: '2023-2024', startDate: new Date(), endDate: new Date(), isCurrent: true, isActive: true}
    ];
    const mocks = setupMocks(seasons);

    const {fixture} = await render(SeasonsList, {
      imports: [NoopAnimationsModule],
      providers: [
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: LayoutService, useValue: mocks.layoutService},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: ActivatedRoute, useValue: {}}
      ]
    });

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();

    expect(rows.length).toBe(1);
    const cells = await rows[0].getCells();
    expect(await cells[0].getText()).toBe('2023-2024');
  });

  it('should call deleteById when deleting a season', async () => {
    const seasons = [{id: '1', name: '2023-2024'}];
    const mocks = setupMocks(seasons);

    const {fixture} = await render(SeasonsList, {
      imports: [NoopAnimationsModule],
      providers: [
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: LayoutService, useValue: mocks.layoutService},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: ActivatedRoute, useValue: {}}
      ]
    });

    // Directly call onDelete since it's triggered by a child component (FormDeleteButton)
    fixture.componentInstance['onDelete']('1');

    expect(mocks.seasonsStore.deleteById).toHaveBeenCalledWith('1');
    expect(mocks.notificationService.show).toHaveBeenCalledWith(expect.stringContaining('supprimée'), 'success');
  });

  it('should reload when clicking retry on error', async () => {
    const mocks = setupMocks([]);
    mocks.seasonsStore.errorSignal.set(new Error('Test Error'));

    const {fixture} = await render(SeasonsList, {
      imports: [NoopAnimationsModule],
      providers: [
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: LayoutService, useValue: mocks.layoutService},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: ActivatedRoute, useValue: {}}
      ]
    });

    fixture.componentInstance['retry']();
    expect(mocks.seasonsStore.reload).toHaveBeenCalled();
  });
});

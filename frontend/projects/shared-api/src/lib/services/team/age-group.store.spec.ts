import {describe, expect, it, beforeEach, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {AgeGroupStore} from './age-group.store';
import {AgeGroupGateway} from './age-group.gateway';
import {of} from 'rxjs';
import {AgeGroup} from '@shared-domain';
import {signal} from '@angular/core';

describe('AgeGroupStore', () => {
  let store: AgeGroupStore;
  let gatewayMock: any;

  const mockAgeGroups: AgeGroup[] = [
    { id: '1', name: 'U18', ageLimit: 18, upperLimit: true },
    { id: '2', name: 'Séniors', ageLimit: 18, upperLimit: false }
  ];

  const mockResource = {
    value: vi.fn(() => mockAgeGroups),
    hasValue: vi.fn(() => true),
    isLoading: signal(false),
    error: signal(null),
    update: vi.fn((updateFn: (list: AgeGroup[]) => AgeGroup[]) => {
      const newList = updateFn(mockAgeGroups);
      mockResource.value.mockReturnValue(newList);
    }),
    reload: vi.fn()
  };

  beforeEach(() => {
    gatewayMock = {
      getAgeGroups: vi.fn(() => mockResource),
      addAgeGroup: vi.fn((dto) => of({ id: '3', ...dto })),
      deleteById: vi.fn(() => of(undefined)),
      updateAgeGroup: vi.fn((id, dto) => of({ id, ...dto }))
    };

    TestBed.configureTestingModule({
      providers: [
        AgeGroupStore,
        { provide: AgeGroupGateway, useValue: gatewayMock }
      ]
    });

    store = TestBed.inject(AgeGroupStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should expose ageGroupsSignal from gateway resource', () => {
    expect(store.ageGroupsSignal()).toEqual(mockAgeGroups);
  });

  it('should find age group by id signal', () => {
    const idSignal = signal('1');
    const ageGroupSignal = store.ageGroupById(idSignal);
    expect(ageGroupSignal()).toEqual(mockAgeGroups[0]);

    idSignal.set('unknown');
    expect(ageGroupSignal()).toBeUndefined();
  });

  it('should create an age group and update the resource', () => {
    const dto = { name: 'U15', ageLimit: 15, upperLimit: true };
    store.createAgeGroup(dto).subscribe();

    expect(gatewayMock.addAgeGroup).toHaveBeenCalledWith(dto);
    expect(mockResource.update).toHaveBeenCalled();
  });

  it('should delete an age group and update the resource', () => {
    const id = '1';
    store.deleteById(id).subscribe();

    expect(gatewayMock.deleteById).toHaveBeenCalledWith(id);
    expect(mockResource.update).toHaveBeenCalled();
  });

  it('should update an age group and update the resource', () => {
    const id = '1';
    const dto = { name: 'Updated', ageLimit: 20, upperLimit: true };
    store.updateAgeGroup(id, dto).subscribe();

    expect(gatewayMock.updateAgeGroup).toHaveBeenCalledWith(id, dto);
    expect(mockResource.update).toHaveBeenCalled();
  });

  it('should reload the resource', () => {
    store.reload();
    expect(mockResource.reload).toHaveBeenCalled();
  });
});

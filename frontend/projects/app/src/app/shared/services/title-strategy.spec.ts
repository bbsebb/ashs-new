import { TestBed } from '@angular/core/testing';
import { MyCustomPageTitleStrategy } from './title-strategy';
import { Title, Meta } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('MyCustomPageTitleStrategy', () => {
  let strategy: MyCustomPageTitleStrategy;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyCustomPageTitleStrategy, Title, Meta]
    });
    strategy = TestBed.inject(MyCustomPageTitleStrategy);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  it('should update title to ASHS | Teams for teams route', () => {
    const spyTitle = vi.spyOn(titleService, 'setTitle');
    const mockSnapshot = { root: {} } as RouterStateSnapshot;
    vi.spyOn(strategy as any, 'buildTitle').mockReturnValue('Teams');

    strategy.updateTitle(mockSnapshot);
    expect(spyTitle).toHaveBeenCalledWith('ASHS | Teams');
  });

  it('should use default title if buildTitle returns undefined', () => {
    const spyTitle = vi.spyOn(titleService, 'setTitle');
    vi.spyOn(strategy as any, 'buildTitle').mockReturnValue(undefined);

    strategy.updateTitle({} as any);
    expect(spyTitle).toHaveBeenCalledWith('AS Hoenheim sports');
  });
});

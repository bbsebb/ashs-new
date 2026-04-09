import { SafePipe } from './safe.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('SafePipe', () => {
  let pipe: SafePipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SafePipe,
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: (val: string) => `safe-${val}`
          }
        }
      ]
    });
    pipe = TestBed.inject(SafePipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should bypass security for resource URL', () => {
    const url = 'https://example.com';
    const spy = vi.spyOn(sanitizer, 'bypassSecurityTrustResourceUrl');
    const result = pipe.transform(url);
    expect(spy).toHaveBeenCalledWith(url);
    expect(result).toBe('safe-https://example.com');
  });
});

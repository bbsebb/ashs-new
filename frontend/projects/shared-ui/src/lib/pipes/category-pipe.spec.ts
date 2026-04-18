import {describe, expect, it} from 'vitest';
import {CategoryPipe} from '@shared-ui';

describe('CategoryPipe', () => {
  const pipe = new CategoryPipe();

  it('should transform with short format by default', () => {
    expect(pipe.transform(18, true)).toBe('-18 ans');
    expect(pipe.transform(18, false)).toBe('+18 ans');
  });

  it('should transform with long format correctly', () => {
    expect(pipe.transform(18, true, 'long')).toBe('Moins de 18 ans');
    expect(pipe.transform(18, false, 'long')).toBe('Sénior');
  });

  it('should transform different age limits correctly', () => {
    expect(pipe.transform(15, true)).toBe('-15 ans');
    expect(pipe.transform(15, true, 'long')).toBe('Moins de 15 ans');
    expect(pipe.transform(20, false)).toBe('+20 ans');
  });
});

import {describe, expect, it} from 'vitest';
import {CategoryPipe} from '@shared-ui';

describe('AgeLimitPipe', () => {
  const pipe = new CategoryPipe();

  it('should transform true to "-" in short format', () => {
    expect(pipe.transform(true)).toBe('-');
  });

  it('should transform false to "+" in short format', () => {
    expect(pipe.transform(false)).toBe('+');
  });

  it('should transform true to "Moins de" in long format', () => {
    expect(pipe.transform(true, 'long')).toBe('Moins de');
  });

  it('should transform false to "Plus de" in long format', () => {
    expect(pipe.transform(false, 'long')).toBe('Plus de');
  });
});

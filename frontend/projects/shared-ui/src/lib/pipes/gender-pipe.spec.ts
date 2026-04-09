import {describe, expect, it} from 'vitest';
import {GenderPipe} from './gender-pipe';

describe('GenderPipe', () => {
  const pipe = new GenderPipe();

  it('should transform "Male" correctly', () => {
    expect(pipe.transform('Male')).toBe('Masc.');
    expect(pipe.transform('Male', 'long')).toBe('Masculin');
  });

  it('should transform "Female" correctly', () => {
    expect(pipe.transform('Female')).toBe('Fém.');
    expect(pipe.transform('Female', 'long')).toBe('Feminin');
  });

  it('should transform "Mixte" correctly', () => {
    expect(pipe.transform('Mixte')).toBe('Mixte');
    expect(pipe.transform('Mixte', 'long')).toBe('Mixte');
  });
});

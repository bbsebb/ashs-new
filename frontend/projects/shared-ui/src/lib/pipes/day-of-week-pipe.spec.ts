import {describe, expect, it} from 'vitest';
import {DayOfWeekPipe} from './day-of-week-pipe';

describe('DayOfWeekPipe', () => {
  const pipe = new DayOfWeekPipe();

  it('should transform days correctly', () => {
    expect(pipe.transform('MONDAY')).toBe('Lundi');
    expect(pipe.transform('SUNDAY')).toBe('Dimanche');
  });
});

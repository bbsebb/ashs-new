import {describe, expect, it} from 'vitest';
import {RoleStaffPipe} from './role-staff-pipe';

describe('RoleStaffPipe', () => {
  const pipe = new RoleStaffPipe();

  it('should transform roles correctly', () => {
    expect(pipe.transform('COACH')).toBe('Entraineur');
    expect(pipe.transform('SUPPORT')).toBe('Adjoint');
    expect(pipe.transform('ASSISTANT')).toBe('Accompagnateur');
  });
});

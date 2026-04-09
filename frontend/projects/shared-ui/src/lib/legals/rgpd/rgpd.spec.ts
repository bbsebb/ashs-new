import { render } from '@testing-library/angular';
import { Rgpd } from './rgpd';
import { describe, expect, it } from 'vitest';

describe('Rgpd Component', () => {
  it('should create', async () => {
    const { fixture } = await render(Rgpd);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

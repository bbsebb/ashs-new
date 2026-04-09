import { render } from '@testing-library/angular';
import { MentionsLegales } from './mentions-legales';
import { describe, expect, it } from 'vitest';

describe('MentionsLegales Component', () => {
  it('should create', async () => {
    const { fixture } = await render(MentionsLegales);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

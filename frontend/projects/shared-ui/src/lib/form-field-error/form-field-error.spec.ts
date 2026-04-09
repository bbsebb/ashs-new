import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { FormFieldErrorDirective } from './form-field-error';

@Component({
  standalone: true,
  imports: [FormFieldErrorDirective],
  template: `
    <div *appError="field; fallback: 'Fallback Error'; let errorMsg">
      {{ errorMsg }}
    </div>
  `
})
class TestHostComponent {
  field: any;
}

describe('FormFieldErrorDirective', () => {
  const createMockField = (invalid: boolean, touched: boolean, dirty: boolean, errors: any[] = []) => {
    const state = {
      invalid: signal(invalid),
      touched: signal(touched),
      dirty: signal(dirty),
      errors: signal(errors)
    };
    return signal(state) as any;
  };

  it('should not show error message if field is valid', async () => {
    const field = createMockField(false, true, true);
    await render(TestHostComponent, {
      componentProperties: { field }
    });

    expect(screen.queryByText('Fallback Error')).toBeNull();
  });

  it('should not show error message if field is invalid but not touched or dirty', async () => {
    const field = createMockField(true, false, false);
    await render(TestHostComponent, {
      componentProperties: { field }
    });

    expect(screen.queryByText('Fallback Error')).toBeNull();
  });

  it('should show fallback message if field is invalid and touched, but has no errors array', async () => {
    const field = createMockField(true, true, false, []);
    await render(TestHostComponent, {
      componentProperties: { field }
    });

    expect(screen.getByText('Fallback Error')).toBeTruthy();
  });

  it('should show specific error message if provided', async () => {
    const field = createMockField(true, false, true, [{ message: 'Specific Error' }]);
    await render(TestHostComponent, {
      componentProperties: { field }
    });

    expect(screen.getByText('Specific Error')).toBeTruthy();
  });

  it('should update message when errors change', async () => {
    const errorsSignal = signal([{ message: 'Error 1' }]);
    const state = {
      invalid: signal(true),
      touched: signal(true),
      dirty: signal(false),
      errors: errorsSignal
    };
    const field = signal(state) as any;

    const { fixture, detectChanges } = await render(TestHostComponent, {
      componentProperties: { field }
    });

    expect(screen.getByText('Error 1')).toBeTruthy();

    errorsSignal.set([{ message: 'Error 2' }]);
    detectChanges();

    expect(screen.getByText('Error 2')).toBeTruthy();
  });

  it('should hide message when field becomes valid', async () => {
    const invalidSignal = signal(true);
    const state = {
      invalid: invalidSignal,
      touched: signal(true),
      dirty: signal(false),
      errors: signal([{ message: 'Error' }])
    };
    const field = signal(state) as any;

    const { fixture, detectChanges } = await render(TestHostComponent, {
      componentProperties: { field }
    });

    expect(screen.getByText('Error')).toBeTruthy();

    invalidSignal.set(false);
    detectChanges();

    expect(screen.queryByText('Error')).toBeNull();
  });
});

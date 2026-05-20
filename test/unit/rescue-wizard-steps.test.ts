import { describe, expect, it } from 'vitest';
import {
  getRescueStepCount,
  getRescueStepItems,
  getWizardStepKind,
} from '~/utils/rescue-request';

describe('rescue wizard step order', () => {
  it('places quote as last step before summary for rescue', () => {
    expect(getWizardStepKind(0, 'rescue')).toBe('basics');
    expect(getWizardStepKind(1, 'rescue')).toBe('location');
    expect(getWizardStepKind(2, 'rescue')).toBe('supplier');
    expect(getWizardStepKind(3, 'rescue')).toBe('quote');
    expect(getWizardStepKind(4, 'rescue')).toBe('summary');
  });

  it('lists quote step third in rescue stepper items', () => {
    const items = getRescueStepItems('rescue');
    expect(items.map((i) => i.title)).toEqual([
      'Datos',
      'Ubicación',
      'Proveedor',
      'Cotización',
      'Resumen',
    ]);
    expect(getRescueStepCount('rescue')).toBe(5);
  });

  it('keeps short flow as datos → cotización → resumen', () => {
    expect(getWizardStepKind(1, 'loan')).toBe('quote');
    expect(getWizardStepKind(2, 'loan')).toBe('summary');
    expect(getRescueStepItems('proyect').map((i) => i.title)).toEqual([
      'Datos',
      'Cotización',
      'Resumen',
    ]);
  });
});

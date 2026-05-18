import type { StepperItem } from '@nuxt/ui';
import type { RescueServiceType } from '~/interfaces/rescue';

export function getRescueStepItems(
  serviceType: RescueServiceType,
): StepperItem[] {
  if (serviceType === 'rescue') {
    return [
      {
        title: 'Datos',
        description: 'Tipo y cliente',
        icon: 'i-lucide-clipboard-list',
        value: 0,
      },
      {
        title: 'Ubicación',
        description: 'Unidad en mapa',
        icon: 'i-lucide-map-pin',
        value: 1,
      },
      {
        title: 'Proveedor',
        description: 'Opcional',
        icon: 'i-lucide-truck',
        value: 2,
      },
      {
        title: 'Resumen',
        description: 'Confirmar',
        icon: 'i-lucide-check-circle',
        value: 3,
      },
    ];
  }

  return [
    {
      title: 'Datos',
      description: 'Tipo y cliente',
      icon: 'i-lucide-clipboard-list',
      value: 0,
    },
    {
      title: 'Resumen',
      description: 'Confirmar',
      icon: 'i-lucide-check-circle',
      value: 1,
    },
  ];
}

export function getRescueStepCount(serviceType: RescueServiceType): number {
  return getRescueStepItems(serviceType).length;
}

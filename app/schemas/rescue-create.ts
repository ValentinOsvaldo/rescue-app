import * as z from 'zod';
import type { RescueCreateBody, RescueServiceType } from '~/interfaces/rescue';
const RESCUE_SERVICE_TYPES = [
  'rescue',
  'loan',
  'proyect',
  'direct_budget',
] as const;

export function parseRescueCoord(
  value: string | null | undefined,
): number | undefined {
  const trimmed = (value ?? '').trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

const optionalCoordString = (label: string, min: number, max: number) =>
  z
    .string()
    .transform((s) => s.trim())
    .superRefine((s, ctx) => {
      if (s === '') return;
      const n = parseRescueCoord(s);
      if (n == null) {
        ctx.addIssue({
          code: 'custom',
          message: `${label} no es un número válido`,
        });
        return;
      }
      if (n < min || n > max) {
        ctx.addIssue({
          code: 'custom',
          message: `${label} debe estar entre ${min} y ${max}`,
        });
      }
    });

const coordFromNullable = (label: string, min: number, max: number) =>
  z.preprocess(
    (v) => (v == null ? '' : String(v)),
    optionalCoordString(label, min, max),
  );

const requiredCoordFromNullable = (label: string, min: number, max: number) =>
  z.preprocess(
    (v) => (v == null ? '' : String(v)),
    z
      .string()
      .transform((s) => s.trim())
      .superRefine((s, ctx) => {
        if (s === '') {
          ctx.addIssue({
            code: 'custom',
            message: `${label} es obligatoria`,
          });
          return;
        }
        const n = parseRescueCoord(s);
        if (n == null) {
          ctx.addIssue({
            code: 'custom',
            message: `${label} no es un número válido`,
          });
          return;
        }
        if (n < min || n > max) {
          ctx.addIssue({
            code: 'custom',
            message: `${label} debe estar entre ${min} y ${max}`,
          });
        }
      }),
  );

const serviceTypeField = z.enum(RESCUE_SERVICE_TYPES, {
  error: 'Selecciona un tipo de servicio',
});

const clientField = z.number().int().positive({ error: 'Selecciona un cliente' });

const serialNumberField = z
  .string()
  .transform((s) => s.trim())
  .optional()
  .default('');

const managerFieldOptional = z.number().int().positive().optional();

export const rescueStepBasicsSchema = z
  .object({
    service_type: serviceTypeField,
    client: clientField,
    general_public: z.boolean(),
    serialNumber: serialNumberField,
    manager: managerFieldOptional,
  })
  .superRefine((data, ctx) => {
    if (data.manager == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Selecciona un gestor',
        path: ['manager'],
      });
    }
  });

export const rescueStepLocationSchema = z.object({
  location_latitude: requiredCoordFromNullable('La latitud', -90, 90),
  location_longitude: requiredCoordFromNullable('La longitud', -180, 180),
  location_description: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, { error: 'Indica la descripción del lugar' })),
  service_description: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, { error: 'Indica la descripción del servicio' })),
});

export const rescueStepSupplierSchema = z.object({
  supplier: z.number().int().positive().nullable().optional(),
});

export const rescueStepSummarySchema = z.object({
  internal_notes: z.string().transform((s) => s.trim()),
});

export const rescueCreateFormSchema = z
  .object({
    service_type: serviceTypeField,
    client: clientField,
    general_public: z.boolean(),
    serialNumber: serialNumberField,
    manager: managerFieldOptional,
    location_latitude: coordFromNullable('La latitud', -90, 90),
    location_longitude: coordFromNullable('La longitud', -180, 180),
    location_description: z.string().transform((s) => s.trim()),
    service_description: z.string().transform((s) => s.trim()),
    supplier: z.number().int().positive().nullable().optional(),
    internal_notes: z.string().transform((s) => s.trim()),
  })
  .superRefine((data, ctx) => {
    if (data.manager == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Selecciona un gestor',
        path: ['manager'],
      });
    }
    if (data.service_type !== 'rescue') {
      return;
    }
    const lat = parseRescueCoord(
      data.location_latitude as string | null | undefined,
    );
    const lng = parseRescueCoord(
      data.location_longitude as string | null | undefined,
    );
    if (lat == null || lng == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Indica la ubicación en el mapa',
        path: ['location_latitude'],
      });
    }
    if (!data.location_description) {
      ctx.addIssue({
        code: 'custom',
        message: 'Indica la descripción del lugar',
        path: ['location_description'],
      });
    }
    if (!data.service_description) {
      ctx.addIssue({
        code: 'custom',
        message: 'Indica la descripción del servicio',
        path: ['service_description'],
      });
    }
  });

export type RescueCreateFormOutput = z.output<typeof rescueCreateFormSchema>;

export type RescueRequestFormState = {
  service_type: RescueServiceType;
  client: number | undefined;
  general_public: boolean;
  serialNumber: string;
  service_description: string;
  location_latitude: string | null;
  location_longitude: string | null;
  location_description: string;
  supplier: number | null;
  supplierLabel: string;
  manager: number | undefined;
  managerLabel: string;
  internal_notes: string;
  clientLabel: string;
};

export function emptyRescueRequestState(): RescueRequestFormState {
  return {
    service_type: 'rescue',
    client: undefined,
    general_public: false,
    serialNumber: '',
    service_description: '',
    location_latitude: null,
    location_longitude: null,
    location_description: '',
    supplier: null,
    supplierLabel: '',
    manager: undefined,
    managerLabel: '',
    internal_notes: '',
    clientLabel: '',
  };
}

export function getStepSchemaForIndex(
  stepIndex: number,
  serviceType: RescueServiceType,
) {
  if (serviceType === 'rescue') {
    switch (stepIndex) {
      case 0:
        return rescueStepBasicsSchema;
      case 1:
        return rescueStepLocationSchema;
      case 2:
        return rescueStepSupplierSchema;
      case 3:
        return rescueStepSummarySchema;
      default:
        return rescueStepBasicsSchema;
    }
  }
  if (stepIndex === 0) return rescueStepBasicsSchema;
  return rescueStepSummarySchema;
}

export function rescueFormToCreateBody(
  data: RescueCreateFormOutput,
): RescueCreateBody {
  const serial = String(data.serialNumber ?? '').trim();
  return {
    service_type: data.service_type,
    client: data.client,
    general_public: data.general_public,
    ...(serial ? { serial_number: serial } : {}),
    service_description: data.service_description,
    supplier: data.supplier ?? null,
    manager: data.manager ?? null,
    location_latitude: String(data.location_latitude ?? '').trim(),
    location_longitude: String(data.location_longitude ?? '').trim(),
    location_description: data.location_description,
    internal_notes: data.internal_notes,
  };
}

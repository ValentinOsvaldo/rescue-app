import * as z from 'zod';
import type { ContractCreateBody, ContractItemCreateBody } from '~/interfaces/catalogs/contract';

const requiredStr = (label: string) =>
  z.string().transform((s) => s.trim()).pipe(z.string().min(1, `${label} es obligatorio`));

export const companyCreateSchema = z.object({
  name: requiredStr('El nombre'),
  business_name: requiredStr('La razón social'),
  rfc: requiredStr('El RFC'),
  phone: requiredStr('El teléfono'),
  email: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.email({ error: 'Introduce un correo válido' })),
  address: requiredStr('La dirección'),
  client_type: z.enum(['CASH', 'CREDIT'], {
    error: 'Selecciona un tipo de cliente',
  }),
  billing_type: z.enum(['DIRECT_INVOICE', 'MANUAL'], {
    error: 'Selecciona un tipo de facturación',
  }),
  commission_type: z.enum(['PERCENTAGE', 'FIXED'], {
    error: 'Selecciona un tipo de comisión',
  }),
  commission_value: requiredStr('El valor de comisión'),
  commission_fixed: requiredStr('La comisión fija'),
  price_multiplier: requiredStr('El multiplicador de precio'),
});

export const clientCreateSchema = companyCreateSchema.extend({
  company: z.number().int().positive({ error: 'Selecciona una compañía' }),
  seller: z.number().int().positive({ error: 'Indica el ID del vendedor' }),
  notes: z.string(),
});

export const serviceCreateSchema = z.object({
  name: requiredStr('El nombre'),
  description: requiredStr('La descripción'),
  category: z.number().int().positive({ error: 'Selecciona una categoría' }),
  unit: requiredStr('La unidad'),
  warranty: z.boolean(),
});

export const categoryCreateSchema = z.object({
  name: requiredStr('El nombre'),
});

export const contractLineFormSchema = z.object({
  service: z.number().int().positive({ error: 'Selecciona un servicio' }),
  price: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, 'Indica el precio')),
  price_multiplier: z.string(),
  percentaje: z.string(),
  notes: z.string(),
});

export const contractCreateFormSchema = z.object({
  client: z.number().int().positive({ error: 'Selecciona un cliente' }),
  notes: z.string(),
  items: z
    .array(contractLineFormSchema)
    .min(1, 'Agrega al menos una partida'),
});

export function contractFormToApiBody(
  input: z.output<typeof contractCreateFormSchema>,
): ContractCreateBody {
  return {
    client: input.client,
    notes: input.notes,
    items: input.items.map((row) => {
      const item: ContractItemCreateBody = {
        service: row.service,
        price: row.price,
      };
      const pm = row.price_multiplier.trim();
      const pct = row.percentaje.trim();
      const n = row.notes.trim();
      if (pm) item.price_multiplier = pm;
      if (pct) item.percentaje = pct;
      if (n) item.notes = n;
      return item;
    }),
  };
}

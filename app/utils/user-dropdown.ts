import type { CatalogDropdownRow } from '~/interfaces/shared/catalog-dropdown.interface';

export function mapUserDropdownRow(
  raw: Record<string, unknown>,
): CatalogDropdownRow {
  const id = Number(raw.id);
  const first = String(raw.first_name ?? '').trim();
  const last = String(raw.last_name ?? '').trim();
  const combined = [first, last].filter(Boolean).join(' ').trim();
  const name =
    combined
    || String(raw.name ?? '').trim()
    || String(raw.username ?? '').trim()
    || 'Sin nombre';
  return { id, name };
}

import type { SupplierListItem } from '~/interfaces/catalogs/supplier';
import type { RescueSupplierNearbyRow } from '~/interfaces/rescue';

export function mapSupplierListItem(
  row: SupplierListItem,
): RescueSupplierNearbyRow {
  const distanceRaw = row.distance_km ?? row.distance;
  const distance_km =
    distanceRaw != null && Number.isFinite(Number(distanceRaw))
      ? Number(distanceRaw)
      : null;

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    is_trusted: row.is_trusted,
    score: row.score,
    ranking: row.score,
    distance_km,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
  };
}

export function groupTrustedFirst(
  list: RescueSupplierNearbyRow[],
): RescueSupplierNearbyRow[] {
  const trusted = list.filter((s) => s.is_trusted);
  const rest = list.filter((s) => !s.is_trusted);
  return [...trusted, ...rest];
}

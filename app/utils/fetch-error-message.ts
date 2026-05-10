function stringifyDetail(detail: unknown): string | null {
  if (typeof detail === 'string') {
    const s = detail.trim();
    return s.length > 0 ? s : null;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join('. ') : null;
  }
  return null;
}

function stringifyFieldErrors(data: Record<string, unknown>): string | null {
  const skip = new Set(['detail', 'message', 'non_field_errors']);
  const parts: string[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (skip.has(key)) continue;
    if (typeof val === 'string' && val.trim()) {
      parts.push(`${key}: ${val.trim()}`);
    } else if (Array.isArray(val)) {
      const strs = val
        .filter((x): x is string => typeof x === 'string')
        .map((s) => s.trim())
        .filter(Boolean);
      if (strs.length) parts.push(`${key}: ${strs.join(', ')}`);
    }
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}

export function getFetchErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'No se pudo completar la operación.';
  }

  const err = error as Record<string, unknown>;
  const data = err.data;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;

    const fromDetail = stringifyDetail(d.detail);
    if (fromDetail) return fromDetail;

    const msg = d.message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();

    const nfe = stringifyDetail(d.non_field_errors);
    if (nfe) return nfe;

    const fields = stringifyFieldErrors(d);
    if (fields) return fields;
  }

  if (typeof err.statusMessage === 'string' && err.statusMessage.trim()) {
    return err.statusMessage.trim();
  }

  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }

  return 'No se pudo completar la operación.';
}

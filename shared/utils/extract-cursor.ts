export function extractCursor(url: string) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('cursor');
}

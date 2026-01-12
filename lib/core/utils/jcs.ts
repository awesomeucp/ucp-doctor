/**
 * JSON Canonicalization Scheme (RFC 8785) implementation
 * Used for consistent signature computation in AP2
 */

/**
 * Canonicalize a JSON value according to RFC 8785
 * @param obj - The value to canonicalize
 * @returns Canonical JSON string
 */
export function canonicalize(obj: unknown): string {
  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj.toString();
  if (typeof obj === 'string') return JSON.stringify(obj);
  if (typeof obj === 'number') {
    // RFC 8785 number serialization rules
    if (!Number.isFinite(obj)) {
      throw new Error('Non-finite numbers not allowed in JCS');
    }
    if (Object.is(obj, -0)) return '0';
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    const elements = obj.map(canonicalize);
    return `[${elements.join(',')}]`;
  }

  if (typeof obj === 'object') {
    const sorted = Object.keys(obj as Record<string, unknown>)
      .sort()
      .map((key) => {
        const value = (obj as Record<string, unknown>)[key];
        return `${JSON.stringify(key)}:${canonicalize(value)}`;
      });
    return `{${sorted.join(',')}}`;
  }

  throw new Error(`Unsupported type for canonicalization: ${typeof obj}`);
}

/**
 * Canonicalize object excluding specified top-level keys
 * Used to exclude 'ap2' field from signature computation
 * @param obj - The object to canonicalize
 * @param excludeKeys - Keys to exclude from canonicalization
 * @returns Canonical JSON string
 */
export function canonicalizeExcluding(
  obj: Record<string, unknown>,
  excludeKeys: string[]
): string {
  const filtered = { ...obj };
  for (const key of excludeKeys) {
    delete filtered[key];
  }
  return canonicalize(filtered);
}

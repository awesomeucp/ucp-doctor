/**
 * Cryptographic utilities for AP2 signature verification
 */

import { importJWK, jwtVerify, type JWK } from 'jose';
import { canonicalize } from './jcs';

/**
 * Parse detached JWS format: header..signature
 * @param jws - Detached JWS string
 * @returns Parsed header and signature components
 */
export function parseDetachedJWS(jws: string): {
  header: string;
  signature: string;
  headerDecoded: Record<string, unknown>;
} {
  const parts = jws.split('.');
  if (parts.length !== 3 || parts[1] !== '') {
    throw new Error('Invalid detached JWS format - expected header..signature');
  }

  const [header, , signature] = parts;

  // Decode header to extract kid and alg
  const headerDecoded = JSON.parse(
    Buffer.from(header, 'base64url').toString('utf-8')
  );

  return { header, signature, headerDecoded };
}

/**
 * Convert JWK to jose KeyLike object
 * @param jwk - JWK object
 * @returns KeyLike for verification
 */
export async function jwkToKeyLike(jwk: JWK) {
  try {
    return await importJWK(jwk, jwk.alg);
  } catch (error) {
    throw new Error(
      `Failed to import JWK: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Verify detached JWS signature using JCS canonicalization
 * @param jws - Detached JWS string (header..signature)
 * @param payload - The payload to verify
 * @param key - JWK public key
 * @param excludeFields - Fields to exclude from payload canonicalization
 * @returns True if signature is valid
 */
export async function verifyDetachedJWS(
  jws: string,
  payload: Record<string, unknown>,
  key: JWK,
  excludeFields: string[] = []
): Promise<boolean> {
  try {
    const { header, signature, headerDecoded } = parseDetachedJWS(jws);

    // Validate algorithm
    const alg = headerDecoded.alg as string;
    if (!['ES256', 'ES384', 'ES512'].includes(alg)) {
      throw new Error(`Unsupported algorithm: ${alg}`);
    }

    // Canonicalize payload (excluding specified fields)
    const filtered = { ...payload };
    for (const field of excludeFields) {
      delete filtered[field];
    }
    const canonicalPayload = canonicalize(filtered);

    // Encode payload to base64url
    const payloadEncoded = Buffer.from(canonicalPayload).toString('base64url');

    // Reconstruct full JWS: header.payload.signature
    const fullJWS = `${header}.${payloadEncoded}.${signature}`;

    // Import key and verify
    const keyLike = await jwkToKeyLike(key);
    await jwtVerify(fullJWS, keyLike, {
      algorithms: [alg],
    });

    return true;
  } catch (error) {
    // Verification failed
    return false;
  }
}

/**
 * Validate SD-JWT format (basic structure check)
 * @param sdJwt - SD-JWT+kb string
 * @returns True if format is valid
 */
export function validateSDJWTFormat(sdJwt: string): boolean {
  // SD-JWT+kb format: header.payload.signature~disclosure1~disclosure2~...~kb_jwt
  // Pattern: base64url.base64url.base64url(~base64url)*
  const pattern =
    /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+(~[A-Za-z0-9_-]+)*$/;
  return pattern.test(sdJwt);
}

/**
 * Find signing key by kid in signing_keys array
 * @param signingKeys - Array of JWK signing keys
 * @param kid - Key ID to find
 * @returns Matching JWK or undefined
 */
export function findSigningKey(
  signingKeys: JWK[],
  kid: string
): JWK | undefined {
  return signingKeys.find((key) => key.kid === kid);
}

/**
 * Validate JWK structure for EC keys
 * @param jwk - JWK to validate
 * @returns True if valid EC key
 */
export function validateECKey(jwk: JWK): boolean {
  if (jwk.kty !== 'EC') return false;
  return !!(jwk.crv && jwk.x && jwk.y);
}

/**
 * Validate JWK structure for RSA keys
 * @param jwk - JWK to validate
 * @returns True if valid RSA key
 */
export function validateRSAKey(jwk: JWK): boolean {
  if (jwk.kty !== 'RSA') return false;
  return !!(jwk.n && jwk.e);
}

/**
 * Check if algorithm is supported for AP2
 * @param alg - Algorithm string
 * @returns True if supported
 */
export function isAP2SupportedAlgorithm(alg: string): boolean {
  return ['ES256', 'ES384', 'ES512'].includes(alg);
}

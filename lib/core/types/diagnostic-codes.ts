/**
 * UCP Doctor Diagnostic Codes
 * These are validation error codes for ucp-doctor checks, NOT UCP protocol errors
 */

export enum DiagnosticCode {
  // Order Capability Codes
  UCP_ORDER_MISSING_SIGNING_KEYS = 'UCP_ORDER_MISSING_SIGNING_KEYS',

  // AP2 Signature Codes
  AP2_SIGNATURE_INVALID_FORMAT = 'AP2_SIGNATURE_INVALID_FORMAT',
  AP2_SIGNATURE_MISSING_KID = 'AP2_SIGNATURE_MISSING_KID',
  AP2_SIGNATURE_KEY_NOT_FOUND = 'AP2_SIGNATURE_KEY_NOT_FOUND',
  AP2_SIGNATURE_VERIFICATION_FAILED = 'AP2_SIGNATURE_VERIFICATION_FAILED',
  AP2_SIGNATURE_UNSUPPORTED_ALG = 'AP2_SIGNATURE_UNSUPPORTED_ALG',

  // AP2 Mandate Codes
  AP2_MANDATE_INVALID_FORMAT = 'AP2_MANDATE_INVALID_FORMAT',
  AP2_MANDATE_MISSING = 'AP2_MANDATE_MISSING',
  AP2_MANDATE_INVALID_SDJWT = 'AP2_MANDATE_INVALID_SDJWT',

  // Signing Keys Codes
  SIGNING_KEY_INVALID_JWK = 'SIGNING_KEY_INVALID_JWK',
  SIGNING_KEY_UNSUPPORTED_ALG = 'SIGNING_KEY_UNSUPPORTED_ALG',
}

export const DiagnosticMessages: Record<DiagnosticCode, string> = {
  [DiagnosticCode.UCP_ORDER_MISSING_SIGNING_KEYS]:
    'Order capability requires signing_keys for webhook signature verification',

  [DiagnosticCode.AP2_SIGNATURE_INVALID_FORMAT]:
    'AP2 signature must be detached JWS format (header..signature)',

  [DiagnosticCode.AP2_SIGNATURE_MISSING_KID]:
    'AP2 signature header missing kid (key ID) claim',

  [DiagnosticCode.AP2_SIGNATURE_KEY_NOT_FOUND]:
    'Signing key with specified kid not found in signing_keys array',

  [DiagnosticCode.AP2_SIGNATURE_VERIFICATION_FAILED]:
    'AP2 signature verification failed - signature does not match payload',

  [DiagnosticCode.AP2_SIGNATURE_UNSUPPORTED_ALG]:
    'AP2 signature algorithm must be ES256, ES384, or ES512',

  [DiagnosticCode.AP2_MANDATE_INVALID_FORMAT]:
    'Checkout mandate must be valid SD-JWT+kb format',

  [DiagnosticCode.AP2_MANDATE_MISSING]:
    'AP2 capability negotiated but checkout_mandate missing in complete request',

  [DiagnosticCode.AP2_MANDATE_INVALID_SDJWT]:
    'Checkout mandate SD-JWT structure is invalid',

  [DiagnosticCode.SIGNING_KEY_INVALID_JWK]:
    'Signing key does not conform to JWK specification',

  [DiagnosticCode.SIGNING_KEY_UNSUPPORTED_ALG]:
    'Signing key algorithm not supported for UCP (use ES256, ES384, or ES512)',
};

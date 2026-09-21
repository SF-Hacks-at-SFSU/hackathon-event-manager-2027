export function safeReturnTo(value: string | null | undefined, fallback = '/my-dashboard') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback;
  }
  return value;
}

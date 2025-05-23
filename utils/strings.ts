export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || phoneNumber.length < 4) {
    return phoneNumber;
  }
  const last4 = phoneNumber.substring(phoneNumber.length - 4);
  return `XXX-XXX-${last4}`;
}

export function formatPhoneNumber(value: string): string {
  // 1. Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // 2. Limit to 10 digits
  const truncatedDigits = digits.slice(0, 10);

  // 3. Apply formatting
  const length = truncatedDigits.length;
  if (length === 0) {
    return '';
  }
  if (length <= 3) {
    return truncatedDigits;
  }
  if (length <= 6) {
    return `${truncatedDigits.slice(0, 3)}-${truncatedDigits.slice(3)}`;
  }
  return `${truncatedDigits.slice(0, 3)}-${truncatedDigits.slice(3, 6)}-${truncatedDigits.slice(6)}`;
}

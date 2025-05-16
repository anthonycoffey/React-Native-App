export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || phoneNumber.length < 4) {
    return phoneNumber; // Or return a placeholder like 'Invalid Number'
  }
  const last4 = phoneNumber.substring(phoneNumber.length - 4);
  return `XXX-XXX-${last4}`;
}

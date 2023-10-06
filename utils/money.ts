export function centsToDollars(priceInCents: number): string {
  const priceInDollars = (priceInCents / 100).toFixed(2); // Convert cents to dollars and format with two decimal places
  return `$${priceInDollars}`;
}

export function centsToDollars(
  priceInCents: number,
  type?: string | undefined,
): string {
  const priceInDollars = (priceInCents / 100).toFixed(2); // Convert cents to dollars and format with two decimal places
  return type === "numeric" ? `${priceInDollars}` : `$${priceInDollars}`;
}

export function dollarsToCents(priceInDollars: number): number {
  return Math.floor(priceInDollars * 100);
}

export function formatPrice(price: number) {
  // Implement the logic to format the price
  return price.toFixed(2);
}

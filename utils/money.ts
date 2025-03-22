export function centsToDollars(
  priceInCents: number,
  type?: string | undefined,
): string {
  const priceInDollars = formatPrice(priceInCents / 100);
  return type === "numeric" ? `${priceInDollars}` : `$${priceInDollars}`;
}

export function dollarsToCents(priceInDollars: number): number {
  return Math.floor(priceInDollars * 100);
}

export function formatPrice(price: number) {
  return price.toFixed(2);
}
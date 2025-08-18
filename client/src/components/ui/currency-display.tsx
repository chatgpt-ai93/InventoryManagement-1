import { formatCurrency, type CurrencyCode } from "@shared/schema";

interface CurrencyDisplayProps {
  amount: number | string;
  currency?: CurrencyCode;
  className?: string;
}

export function CurrencyDisplay({ amount, currency, className }: CurrencyDisplayProps) {
  return (
    <span className={className}>
      {formatCurrency(amount, currency)}
    </span>
  );
}
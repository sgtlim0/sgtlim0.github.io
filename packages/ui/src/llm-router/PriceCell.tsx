export interface PriceCellProps {
  price: number
  unit?: string
}

export default function PriceCell({ price, unit = '/ 1M 토큰' }: PriceCellProps) {
  const formatPrice = (value: number) => {
    return `₩${value.toLocaleString()}`
  }

  const isLowPrice = price < 500

  return (
    <div className="text-right">
      <div
        className={`text-sm font-medium ${isLowPrice ? 'text-green-600 dark:text-green-400' : 'text-lr-text-primary'}`}
      >
        {formatPrice(price)}
      </div>
      <div className="text-xs text-lr-text-muted">{unit}</div>
    </div>
  )
}

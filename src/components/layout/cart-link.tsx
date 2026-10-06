import { Link } from '@tanstack/react-router'
import { ShoppingCartIcon } from 'lucide-react'
import { useCart } from '@/features/cart/hooks'
import { cn } from '@/lib/utils'

export function CartLink({ className }: { className?: string }) {
  const { itemCount } = useCart()
  const label = itemCount
    ? `Carrinho, ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`
    : 'Carrinho vazio'

  return (
    <Link
      to="/cart"
      aria-label={label}
      className={cn(
        'relative grid size-11 place-items-center text-foreground hover:text-text-accent',
        className,
      )}
    >
      <ShoppingCartIcon className="size-6" aria-hidden />
      {itemCount > 0 && (
        <span
          aria-hidden
          className="absolute top-1 right-0.5 grid size-4 place-items-center rounded-full bg-primary text-tiny font-medium text-ink outline-2 outline-ink"
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  )
}

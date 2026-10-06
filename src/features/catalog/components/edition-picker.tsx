import { CheckIcon } from 'lucide-react'
import { useId } from 'react'
import type { Edition } from '@/contracts/nft'
import { formatEth } from '@/lib/money'
import { cn } from '@/lib/utils'

interface EditionPickerProps {
  editions: Edition[]
  selectedId: string
  onSelect: (editionId: string) => void
}

export function EditionPicker({ editions, selectedId, onSelect }: EditionPickerProps) {
  const groupName = useId()

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-body-md font-bold">Edição:</legend>
      <div className="flex flex-wrap gap-1.5">
        {editions.map((edition) => {
          const soldOut = edition.available === 0
          const selected = edition.id === selectedId
          return (
            <label
              key={edition.id}
              className={cn(
                'relative flex h-7 cursor-pointer items-center rounded-full border px-2 text-body leading-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
                selected
                  ? 'border-primary font-medium text-text-accent'
                  : 'border-border text-text-secondary hover:border-border-soft',
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={edition.id}
                checked={selected}
                onChange={() => {
                  onSelect(edition.id)
                }}
                aria-label={`Edição ${edition.name}, tiragem de ${edition.supply}, ${formatEth(edition.price)}${soldOut ? ', esgotada' : `, ${edition.available} disponíveis`}`}
                className="absolute inset-0 cursor-pointer appearance-none opacity-0"
              />
              <span
                aria-hidden
                className={soldOut ? 'line-through decoration-text-coral' : undefined}
              >
                1/{edition.supply}
              </span>
              {selected && (
                <CheckIcon
                  aria-hidden
                  className="pointer-events-none absolute -top-1 -right-1 size-4 rounded-full bg-primary p-0.5 text-ink"
                />
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

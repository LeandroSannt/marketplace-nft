import { NftImage } from '@/components/nft-image'
import type { QuoteLine } from '@/contracts/quote'
import { formatEth } from '@/lib/money'

export function OrderLines({ lines }: { lines: QuoteLine[] }) {
  return (
    <ul aria-label="Itens do pedido" className="flex flex-col gap-3">
      {lines.map((line) => (
        <li key={`${line.nftId}-${line.editionId}`} className="flex items-center gap-3">
          <NftImage
            artwork={line.artwork}
            alt=""
            sizes="56px"
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-lg"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body-md font-bold">{line.name}</span>
            <span className="text-caption-sm text-text-secondary">
              Edição {line.editionName} · {line.quantity} × {formatEth(line.unitPrice)}
            </span>
          </div>
          <span className="text-body-md font-bold">{formatEth(line.lineTotal)}</span>
        </li>
      ))}
    </ul>
  )
}

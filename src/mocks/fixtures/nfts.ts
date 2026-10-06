import type { Network } from '@/contracts/common'
import type { Artwork, Collection, Edition } from '@/contracts/nft'
import { multiplyEth } from '@/lib/money'
import { createRandom, hexFrom } from '@/mocks/lib/random'

export interface NftRecord {
  id: string
  name: string
  collection: Collection
  network: Network
  artwork: Artwork
  creator: string
  description: string
  gallery: Artwork[]
  editions: Edition[]
  rating: number
  reviewsCount: number
  contractAddress: string
  royaltiesPercent: number
  listedAt: string
  trendingScore: number
  version: number
}

const ARTWORKS: readonly Artwork[] = ['emerald', 'violet', 'onyx', 'amber']

const NAMES: Record<Artwork, readonly string[]> = {
  emerald: ['Emerald Ape', 'Jade Varsity', 'Verdant Chief', 'Moss Regent', 'Fern Captain'],
  violet: ['Violet Nomad', 'Lilac Drifter', 'Plum Wanderer', 'Iris Scout', 'Amethyst Rover'],
  onyx: ['Onyx Sage', 'Ebony Curator', 'Obsidian Muse', 'Coal Poet', 'Raven Critic'],
  amber: ['Amber Echo', 'Golden Groove', 'Honey Beats', 'Saffron Tune', 'Copper Rhythm'],
}

const CREATORS = ['kurio.studio', 'nova.kurio.eth', 'ateliê.mono', 'pixelbrasa', 'cobre.lab']

const COLLECTIONS: readonly Collection[] = [
  'digital-art',
  'photography',
  'music',
  '3d-art',
  'collectibles',
  'generative',
  'gaming',
  'memberships',
  'utility',
]

const NETWORKS: readonly Network[] = ['ethereum', 'polygon', 'solana']

const BASE_PRICES = [
  '0.02',
  '0.045',
  '0.08',
  '0.12',
  '0.25',
  '0.48',
  '0.75',
  '1.19',
  '1.6',
  '2.29',
  '3.4',
  '4.75',
  '6.2',
  '8.9',
  '12.3',
]

const DESCRIPTION =
  'Um colecionável digital finalizado à mão, parte da série de retratos Kurio. Cada edição inclui arquivo em alta resolução, direitos de exibição pessoal e procedência registrada em contrato.'

const SPECIAL: Record<string, Partial<NftRecord>> = {
  'emerald-ape-042': { collection: 'digital-art', network: 'ethereum', trendingScore: 99 },
}

function buildEditions(id: string, basePrice: string, index: number): Edition[] {
  const standardAvailable = index % 11 === 5 ? 0 : 50 - ((index * 7) % 43)
  const editions: Edition[] = [
    {
      id: `${id}-standard`,
      name: 'Padrão',
      price: basePrice,
      supply: 50,
      available: standardAvailable,
      maxPerOrder: 5,
    },
  ]
  if (index % 2 === 0) {
    editions.push({
      id: `${id}-gold`,
      name: 'Ouro',
      price: multiplyEth(basePrice, 2.5),
      supply: 10,
      available: index % 4 === 0 ? 0 : 10 - (index % 7),
      maxPerOrder: 2,
    })
  }
  if (index % 3 === 0) {
    editions.push({
      id: `${id}-genesis`,
      name: 'Gênesis',
      price: multiplyEth(basePrice, 6),
      supply: 1,
      available: index % 9 === 0 ? 0 : 1,
      maxPerOrder: 1,
    })
  }
  return editions
}

export function createNftFixtures(): NftRecord[] {
  const random = createRandom(42)
  const listedBase = Date.UTC(2026, 8, 30, 12)
  const usedSerials = new Set<number>([42])

  return Array.from({ length: 40 }, (_, index) => {
    const artwork = ARTWORKS[index % ARTWORKS.length] ?? 'emerald'
    const names = NAMES[artwork]
    const baseName = names[Math.floor(index / ARTWORKS.length) % names.length] ?? 'Kurio'
    let serial = index === 0 ? 42 : random.int(1, 999)
    while (index !== 0 && usedSerials.has(serial)) serial = random.int(1, 999)
    usedSerials.add(serial)
    const name = `${baseName} #${String(serial).padStart(3, '0')}`
    const id = name.toLowerCase().replace(/#/g, '').replace(/\s+/g, '-')
    const basePrice = index === 0 ? '1.19' : random.pick(BASE_PRICES)
    const otherArtworks = ARTWORKS.filter((item) => item !== artwork)

    return {
      id,
      name,
      collection: COLLECTIONS[index % COLLECTIONS.length] ?? 'digital-art',
      network:
        NETWORKS[(index + Math.floor(index / COLLECTIONS.length)) % NETWORKS.length] ?? 'ethereum',
      artwork,
      creator: random.pick(CREATORS),
      description: DESCRIPTION,
      gallery: [artwork, ...otherArtworks.slice(0, 2)],
      editions: buildEditions(id, basePrice, index),
      rating: Math.round((3.6 + random.next() * 1.4) * 10) / 10,
      reviewsCount: random.int(0, 48),
      contractAddress: `0x${hexFrom(id, 40)}`,
      royaltiesPercent: random.pick([2.5, 5, 7.5, 10]),
      listedAt: new Date(listedBase - index * 6 * 3600_000).toISOString(),
      trendingScore: random.int(0, 95),
      version: 1,
      ...SPECIAL[id],
    }
  })
}

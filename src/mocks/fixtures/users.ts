import type { Wallet } from '@/contracts/wallet'

export const SEED_PASSWORD = 'Kurio2026'

export interface SeedUser {
  id: string
  username: string
  email: string
  displayName: string
  bio: string
  website: string
  ens: string
  favorites: string[]
  wallets: Wallet[]
}

export const SEED_USERS: SeedUser[] = [
  {
    id: 'usr_ana',
    username: 'ana.kurio',
    email: 'colecionador@kurio.dev',
    displayName: 'Ana Kurio',
    bio: 'Coleciono retratos digitais e arte generativa.',
    website: 'https://kurio.dev/ana',
    ens: 'ana.kurio.eth',
    favorites: ['emerald-ape-042'],
    wallets: [
      {
        id: 'wal_ana_primary',
        slot: 'primary',
        provider: 'metamask',
        label: 'nova.kurio.eth',
        address: '0xA91F3c5e7B2d4F6a8C0e1D3b5A7c9E2f4B6dE82C',
        network: 'ethereum',
        ens: 'nova.kurio.eth',
      },
      {
        id: 'wal_ana_secondary',
        slot: 'secondary',
        provider: 'walletconnect',
        label: 'Reserva Polygon',
        address: '0x5Bc7D9e1F3a5B7c9D1e3F5a7B9c1D3e5F7a9B1c3',
        network: 'polygon',
        ens: '',
      },
    ],
  },
  {
    id: 'usr_bruno',
    username: 'bruno.lima',
    email: 'segundo@kurio.dev',
    displayName: 'Bruno Lima',
    bio: '',
    website: '',
    ens: '',
    favorites: [],
    wallets: [
      {
        id: 'wal_bruno_primary',
        slot: 'primary',
        provider: 'coinbase',
        label: 'Carteira do Bruno',
        address: '0x7D2e4F6a8B0c2D4e6F8a0B2c4D6e8F0a2B4c6D8e',
        network: 'ethereum',
        ens: '',
      },
    ],
  },
]

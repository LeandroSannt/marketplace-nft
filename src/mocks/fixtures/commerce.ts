import type { EthAmount, Network } from '@/contracts/common'

export interface CouponRecord {
  code: string
  percentOff: number
  expiresAt: string
}

export const COUPONS: CouponRecord[] = [
  { code: 'KURIO10', percentOff: 10, expiresAt: '2099-12-31T23:59:59.000Z' },
  { code: 'BEMVINDO5', percentOff: 5, expiresAt: '2099-12-31T23:59:59.000Z' },
  { code: 'EXPIRADO20', percentOff: 20, expiresAt: '2024-01-01T00:00:00.000Z' },
]

export const NETWORK_FEES: Record<Network, EthAmount> = {
  ethereum: '0.016',
  polygon: '0.002',
  solana: '0.001',
}

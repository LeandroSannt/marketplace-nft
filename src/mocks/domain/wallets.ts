import type { Network } from '@/contracts/common'

const connections = new Map<string, { walletId: string; network: Network }>()

export function connectWallet(userId: string, walletId: string, network: Network) {
  connections.set(userId, { walletId, network })
}

export function disconnectWallet(userId: string, walletId: string) {
  if (connections.get(userId)?.walletId === walletId) connections.delete(userId)
}

export function isWalletConnected(userId: string, walletId: string, network: Network) {
  const connection = connections.get(userId)
  return connection?.walletId === walletId && connection.network === network
}

export function clearWalletConnections() {
  connections.clear()
}

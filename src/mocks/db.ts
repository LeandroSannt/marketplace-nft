import type { User } from '@/contracts/auth'
import type { Order } from '@/contracts/order'
import type { Quote } from '@/contracts/quote'
import type { Wallet } from '@/contracts/wallet'
import { createNftFixtures, type NftRecord } from '@/mocks/fixtures/nfts'
import { SEED_PASSWORD, SEED_USERS } from '@/mocks/fixtures/users'
import { createSalt, hashPassword } from '@/mocks/lib/crypto'

export interface UserRecord extends User {
  passwordHash: string
  salt: string
}

export interface SessionRecord {
  token: string
  userId: string
  expiresAt: string
  revoked: boolean
}

export interface CartLine {
  nftId: string
  editionId: string
  quantity: number
}

export interface CartRecord {
  id: string
  ownerId: string | null
  items: CartLine[]
  couponCode: string | null
  version: number
}

export interface QuoteRecord extends Quote {
  userId: string | null
  cartId: string
}

export interface OrderRecord extends Order {
  userId: string
  cartId: string
  idempotencyKey: string
  requestHash: string
  settleAt: string
  outcome: 'confirmed' | 'declined'
}

export interface MockState {
  schemaVersion: number
  nfts: NftRecord[]
  users: UserRecord[]
  sessions: SessionRecord[]
  favorites: Record<string, string[]>
  carts: Record<string, CartRecord>
  quotes: Record<string, QuoteRecord>
  orders: Record<string, OrderRecord>
  wallets: Record<string, Wallet[]>
  consumedTriggers: string[]
  eventSequence: number
}

const STORAGE_KEY = 'kurio:mock:db'
const SCHEMA_VERSION = 2

let state: MockState | null = null

async function createSeedState(): Promise<MockState> {
  const users = await Promise.all(
    SEED_USERS.map(async (seed): Promise<UserRecord> => {
      const salt = createSalt()
      return {
        id: seed.id,
        username: seed.username,
        email: seed.email,
        displayName: seed.displayName,
        avatarUrl: null,
        bio: seed.bio,
        website: seed.website,
        ens: seed.ens,
        salt,
        passwordHash: await hashPassword(SEED_PASSWORD, salt),
      }
    }),
  )

  return {
    schemaVersion: SCHEMA_VERSION,
    nfts: createNftFixtures(),
    users,
    sessions: [],
    favorites: Object.fromEntries(SEED_USERS.map((user) => [user.id, [...user.favorites]])),
    carts: {},
    quotes: {},
    orders: {},
    wallets: Object.fromEntries(SEED_USERS.map((user) => [user.id, structuredClone(user.wallets)])),
    consumedTriggers: [],
    eventSequence: 0,
  }
}

function readPersisted(): MockState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as MockState
    return parsed.schemaVersion === SCHEMA_VERSION ? parsed : null
  } catch {
    return null
  }
}

export function persist() {
  if (!state) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}

export async function initDb() {
  state = readPersisted() ?? (await createSeedState())
  persist()
}

export async function resetDb() {
  state = await createSeedState()
  persist()
}

export function db(): MockState {
  if (!state) throw new Error('Mock database not initialized')
  return state
}

export function nextEventSequence() {
  const current = db()
  current.eventSequence += 1
  return current.eventSequence
}

export function consumeTrigger(trigger: string) {
  const current = db()
  if (current.consumedTriggers.includes(trigger)) return false
  current.consumedTriggers.push(trigger)
  persist()
  return true
}

export function toPublicUser(user: UserRecord): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    website: user.website,
    ens: user.ens,
  }
}

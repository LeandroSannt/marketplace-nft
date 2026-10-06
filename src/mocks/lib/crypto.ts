export async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function createSalt() {
  return crypto.randomUUID().replace(/-/g, '')
}

export async function hashJson(value: unknown) {
  return hashPassword(JSON.stringify(value), 'request')
}

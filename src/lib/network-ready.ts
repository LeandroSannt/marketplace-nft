let markReady: () => void = () => undefined

export const networkReady = new Promise<void>((resolve) => {
  markReady = resolve
})

export function markNetworkReady() {
  markReady()
}

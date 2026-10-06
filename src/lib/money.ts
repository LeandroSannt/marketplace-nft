import Big from 'big.js'
import type { EthAmount } from '@/contracts/common'

Big.DP = 18
Big.RM = Big.roundHalfUp

const ETH_DECIMALS = 18

function toEth(value: Big): EthAmount {
  return value.round(ETH_DECIMALS).toFixed()
}

export function addEth(...values: EthAmount[]): EthAmount {
  return toEth(values.reduce((sum, value) => sum.plus(value), new Big(0)))
}

export function subtractEth(value: EthAmount, amount: EthAmount): EthAmount {
  const result = new Big(value).minus(amount)
  return toEth(result.lt(0) ? new Big(0) : result)
}

export function multiplyEth(value: EthAmount, factor: number): EthAmount {
  return toEth(new Big(value).times(factor))
}

export function percentOfEth(value: EthAmount, percent: number): EthAmount {
  return toEth(new Big(value).times(percent).div(100))
}

export function compareEth(a: EthAmount, b: EthAmount): -1 | 0 | 1 {
  return new Big(a).cmp(b)
}

export function isZeroEth(value: EthAmount): boolean {
  return new Big(value).eq(0)
}

const SLIDER_STEP = '0.01'

export function toEthSteps(value: EthAmount): number {
  return new Big(value).div(SLIDER_STEP).round(0, Big.roundDown).toNumber()
}

export function fromEthSteps(steps: number): EthAmount {
  return toEth(new Big(steps).times(SLIDER_STEP))
}

export function formatEthDecimal(value: EthAmount, decimals = 2): string {
  return new Big(value).toFixed(decimals).replace('.', ',')
}

export function formatEth(value: EthAmount, maxDecimals = 4): string {
  const rounded = new Big(value).round(maxDecimals, Big.roundHalfUp)
  const [integer = '0', fraction = ''] = rounded.toFixed(maxDecimals).split('.')
  const trimmed = fraction.replace(/0+$/, '')
  const decimals = trimmed.length < 2 ? trimmed.padEnd(2, '0') : trimmed
  return `${integer}.${decimals} ETH`
}

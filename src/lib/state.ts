import type { StateCode } from '@shared/types'

/**
 * The demo is Idaho-only, but nothing hardcodes 'ID' at the call site. When VGA
 * adds states, this becomes a real selection and the rest of the app is unchanged.
 */
export function currentStateCode(): StateCode {
  return 'ID'
}

export function currentStateName(): string {
  return 'Idaho'
}

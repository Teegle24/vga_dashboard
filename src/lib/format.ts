export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

/** "(208) 555-0142" when we get 10 digits, otherwise the original string. */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 ? `tel:+1${digits.slice(-10)}` : null
}

/** Strips the protocol so links read as "banburygolf.com". */
export function displayUrl(url: string | null | undefined): string {
  if (!url) return '—'
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export function websiteHref(url: string | null | undefined): string | null {
  if (!url) return null
  return url.startsWith('http') ? url : `https://${url}`
}

export function formatHeadcount(count: number | null | undefined): string {
  if (count === null || count === undefined) return '—'
  return `${count} ${count === 1 ? 'player' : 'players'}`
}

export function statusLabel(
  status: 'reaching_out' | 'held' | 'confirmed' | 'complete',
): string {
  switch (status) {
    case 'reaching_out':
      return 'Calling the course'
    case 'held':
      return 'Date held'
    case 'confirmed':
      return 'Field set'
    case 'complete':
      return 'Played'
  }
}

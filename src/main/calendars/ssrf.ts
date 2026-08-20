import { isIP } from 'net'

/**
 * SSRF guard: reject calendar URLs that resolve to localhost, private, link-local,
 * loopback, or cloud metadata addresses before the app fetches them. This prevents a
 * malicious ICS link from probing internal services on the user's network/machine.
 */
const PRIVATE_RANGES: Array<[string, string]> = [
  ['10.0.0.0', '10.255.255.255'],
  ['172.16.0.0', '172.31.255.255'],
  ['192.168.0.0', '192.168.255.255'],
  ['127.0.0.0', '127.255.255.255'],
  ['0.0.0.0', '0.255.255.255'],
  ['169.254.0.0', '169.254.255.255'],
  ['::1', '::1'],
  ['::ffff:127.0.0.1', '::ffff:127.255.255.255'],
  ['fc00::', 'fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'],
  ['fe80::', 'febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff']
]

function ipToNumber(ip: string): bigint {
  const parts = ip.split('.').map(Number)
  return (
    (BigInt(parts[0] ?? 0) << 24n) |
    (BigInt(parts[1] ?? 0) << 16n) |
    (BigInt(parts[2] ?? 0) << 8n) |
    BigInt(parts[3] ?? 0)
  )
}

function isPrivateIp(ip: string): boolean {
  const fam = isIP(ip)
  if (fam === 4) {
    const n = ipToNumber(ip)
    for (const [lo, hi] of PRIVATE_RANGES) {
      if (lo.includes(':') || hi.includes(':')) continue
      if (n >= ipToNumber(lo) && n <= ipToNumber(hi)) return true
    }
    return false
  }
  if (fam === 6) {
    const lower = ip.toLowerCase()
    if (lower === '::1') return true
    if (lower.startsWith('::ffff:') && lower.split('.').length === 4) {
      const v4 = lower.split('::ffff:')[1]
      if (v4 && isIP(v4) === 4) return isPrivateIp(v4)
    }
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true // ULA
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
      return true // link-local
    }
    return false
  }
  return false
}

export function isBlockedHost(url: string): boolean {
  let host: string
  try {
    host = new URL(url).hostname
  } catch {
    return true
  }
  if (!host) return true
  const lower = host.toLowerCase().replace(/\.$/, '')
  if (lower === 'localhost') return true
  if (lower.endsWith('.localhost')) return true
  // Reject raw IPs in private ranges directly.
  if (isIP(lower) !== 0) {
    return isPrivateIp(lower)
  }
  // Non-IP hostnames are allowed (resolved by the OS DNS); only block local/private names.
  return false
}

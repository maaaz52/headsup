import { safeStorage } from 'electron'
import {
  getProviderTokenBlob,
  setProviderTokenBlob,
  clearProviderTokenBlob,
  type ProviderId
} from '../storage'

export interface ProviderTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  email: string
}

function encrypt(plain: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(plain).toString('base64')
  }
  // OS encryption is unavailable (rare on Windows). Fall back to base64 only — tokens are
  // still not stored in plain text, but this is weaker; a note is logged so it's observable.
  console.warn('[headsup] safeStorage unavailable — storing OAuth tokens with base64 only.')
  return Buffer.from(plain, 'utf-8').toString('base64')
}

function decrypt(blob: string): string {
  const buf = Buffer.from(blob, 'base64')
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(buf)
    }
  } catch {
    // fall through to base64 decode
  }
  return buf.toString('utf-8')
}

export function saveTokens(id: ProviderId, tokens: ProviderTokens): void {
  setProviderTokenBlob(id, encrypt(JSON.stringify(tokens)))
}

export function loadTokens(id: ProviderId): ProviderTokens | null {
  const blob = getProviderTokenBlob(id)
  if (!blob) return null
  try {
    const parsed = JSON.parse(decrypt(blob)) as ProviderTokens
    if (!parsed.accessToken) return null
    return parsed
  } catch {
    return null
  }
}

export function clearTokens(id: ProviderId): void {
  clearProviderTokenBlob(id)
}

export function hasTokens(id: ProviderId): boolean {
  return !!getProviderTokenBlob(id)
}

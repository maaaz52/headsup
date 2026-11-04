import { useEffect, useState } from 'react'
import type { ProviderConfig, ProviderStatus } from './api'

interface ProviderRowProps {
  status: ProviderStatus
  onStatusChange: () => Promise<void>
}

export default function ProviderRow({ status, onStatusChange }: ProviderRowProps): React.JSX.Element {
  const [config, setConfig] = useState<ProviderConfig>({ clientId: '', hasSecret: false })
  const [clientSecret, setClientSecret] = useState('')
  const [email, setEmail] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    window.api.getProviderConfig(status.id).then(setConfig).catch(() => {})
  }, [status.id])

  const saveConfig = async (): Promise<void> => {
    setError('')
    await window.api.setProviderConfig(status.id, {
      clientId: config.clientId,
      clientSecret
    })
    setDirty(false)
    setClientSecret('')
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const connect = async (): Promise<void> => {
    setBusy(true)
    setError('')
    try {
      const result = await window.api.connectProvider(status.id)
      setEmail(result.email)
      await onStatusChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect.')
    } finally {
      setBusy(false)
    }
  }

  const disconnect = async (): Promise<void> => {
    await window.api.disconnectProvider(status.id)
    setEmail(null)
    await onStatusChange()
  }

  return (
    <div className={`provider-row ${status.connected ? 'is-connected' : ''}`}>
      <div className="provider-head">
        <div className="provider-identity">
          <span className="provider-icon" aria-hidden="true">{status.id === 'google' ? 'G' : 'M'}</span>
          <span>
            <strong className="provider-name">{status.name}</strong>
            <small>{status.connected ? (email || 'Connected') : 'Not connected'}</small>
          </span>
        </div>
        <div className="provider-actions">
          {!status.connected ? (
            <button className="btn-secondary compact" onClick={connect} disabled={busy || !config.clientId}>
              {busy ? 'Signing in…' : 'Connect'}
            </button>
          ) : (
            <button className="text-button danger" onClick={disconnect}>Disconnect</button>
          )}
          <button className="text-button" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 'Done' : 'Set up'}
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="provider-config">
          <input
            className="input"
            type="text"
            placeholder="Client ID"
            value={config.clientId}
            onChange={(e) => {
              setConfig({ ...config, clientId: e.target.value })
              setDirty(true)
            }}
          />
          <input
            className="input"
            type="password"
            placeholder={config.hasSecret ? 'Client secret (saved — leave blank to keep)' : 'Client secret (optional for desktop apps)'}
            value={clientSecret}
            onChange={(e) => {
              setClientSecret(e.target.value)
              setDirty(true)
            }}
          />
          {dirty && (
            <button className="btn-secondary" onClick={saveConfig}>
              {saved ? 'Saved' : 'Save credentials'}
            </button>
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  )
}

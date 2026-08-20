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
        <span className="provider-name">{status.name}</span>
        {status.connected ? (
          <span className="pill ok">{email ? `Connected · ${email}` : 'Connected'}</span>
        ) : (
          <span className="pill">Not connected</span>
        )}
      </div>

      {!status.connected ? (
        <button className="btn-primary" onClick={connect} disabled={busy || !config.clientId}>
          {busy ? 'Signing in…' : 'Connect'}
        </button>
      ) : (
        <div className="provider-actions">
          <button className="link-btn" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      )}

      <button className="link-btn" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? 'Hide advanced settings' : 'Advanced settings'}
      </button>

      {showAdvanced && (
        <>
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
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  )
}

import { createServer, type Server } from 'http'
import { createHash, randomBytes } from 'crypto'
import { shell } from 'electron'

export interface OAuthFlowOptions {
  authorizeUrl: string
  tokenUrl: string
  clientId: string
  clientSecret?: string
  scopes: string[]
  /** Extra query params appended to the authorize URL (provider-specific). */
  extraParams?: Record<string, string>
}

export interface OAuthTokenResult {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

const NETWORK_TIMEOUT_MS = 30_000

function base64Url(value: Buffer): string {
  return value.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function pkcePair(): { verifier: string; challenge: string } {
  const verifier = base64Url(randomBytes(32))
  const challenge = base64Url(createHash('sha256').update(verifier).digest())
  return { verifier, challenge }
}

async function waitForCallback(server: Server, state: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.close()
      reject(new Error('Timed out waiting for the browser to finish signing in.'))
    }, 5 * 60 * 1000)

    server.on('request', (req, res) => {
      // Only accept the callback endpoint; anything else is noise from local probes.
      const url = new URL(req.url ?? '/', 'http://localhost')
      if (req.method !== 'GET' || !(url.pathname === '/' || url.pathname === '/callback')) {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not found')
        return
      }
      res.setHeader('Cache-Control', 'no-store')
      if (url.searchParams.get('state') !== state) {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('State mismatch. Close this tab and try again.')
        return
      }
      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')
      if (error || !code) {
        clearTimeout(timeout)
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('Sign-in was cancelled or failed. Close this tab and try again.')
        server.close()
        reject(new Error(error ?? 'No authorization code returned.'))
        return
      }
      clearTimeout(timeout)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(
        '<html><body style="font-family:system-ui;text-align:center;padding-top:80px">' +
          '<h2>You can close this tab now</h2>' +
          '<p>headsup has connected your calendar.</p></body></html>'
      )
      server.close()
      resolve(code)
    })
  })
}

async function postForm(url: string, body: URLSearchParams): Promise<{ ok: boolean; json: unknown }> {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS)
  })
  const json = await resp.json().catch(() => ({}))
  return { ok: resp.ok, json }
}

export async function runOAuthFlow(options: OAuthFlowOptions): Promise<OAuthTokenResult> {
  const server = createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const port = (server.address() as { port: number }).port
  const redirectUri = `http://localhost:${port}`

  const { verifier, challenge } = pkcePair()
  const state = base64Url(randomBytes(16))

  const params = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: options.scopes.join(' '),
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  })
  if (options.extraParams) {
    for (const [k, v] of Object.entries(options.extraParams)) params.set(k, v)
  }

  const authUrl = `${options.authorizeUrl}?${params.toString()}`
  await shell.openExternal(authUrl)

  const code = await waitForCallback(server, state)

  const body = new URLSearchParams({
    client_id: options.clientId,
    code,
    code_verifier: verifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri
  })
  if (options.clientSecret) body.set('client_secret', options.clientSecret)

  const { ok, json } = await postForm(options.tokenUrl, body)
  if (!ok) {
    throw new Error('Could not complete sign-in. Please try again.')
  }
  const data = json as { access_token?: string; refresh_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error('Could not complete sign-in. Please try again.')

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? '',
    expiresIn: data.expires_in ?? 3600
  }
}

export async function refreshAccessToken(
  tokenUrl: string,
  clientId: string,
  clientSecret: string | undefined,
  refreshToken: string
): Promise<OAuthTokenResult> {
  const body = new URLSearchParams({
    client_id: clientId,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  })
  if (clientSecret) body.set('client_secret', clientSecret)

  const { ok, json } = await postForm(tokenUrl, body)
  if (!ok) {
    throw new Error('Your sign-in has expired. Reconnect the calendar.')
  }
  const data = json as { access_token?: string; refresh_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error('Your sign-in has expired. Reconnect the calendar.')
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresIn: data.expires_in ?? 3600
  }
}

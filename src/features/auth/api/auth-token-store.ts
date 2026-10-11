type TokenPair = {
  accessToken: string
  refreshToken: string
}

type AuthChannelMessage =
  { type: 'tokens-updated'; tokens: TokenPair } | { type: 'signed-out' }

const REFRESH_TOKEN_KEY = 'react-starter-kit.refresh-token'
const REFRESH_LOCK_NAME = 'react-starter-kit.refresh-lock'
const CHANNEL_NAME = 'react-starter-kit.auth'

let accessToken: string | null = null
const channel =
  typeof BroadcastChannel === 'undefined'
    ? null
    : new BroadcastChannel(CHANNEL_NAME)

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

channel?.addEventListener(
  'message',
  (event: MessageEvent<AuthChannelMessage>) => {
    if (event.data.type === 'tokens-updated') {
      accessToken = event.data.tokens.accessToken
      localStorage.setItem(REFRESH_TOKEN_KEY, event.data.tokens.refreshToken)
    } else {
      accessToken = null
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }

    notify()
  },
)

export function getAccessToken() {
  return accessToken
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(tokens: TokenPair) {
  accessToken = tokens.accessToken
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  channel?.postMessage({
    type: 'tokens-updated',
    tokens,
  } satisfies AuthChannelMessage)
  notify()
}

export function clearTokens() {
  accessToken = null
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  channel?.postMessage({ type: 'signed-out' } satisfies AuthChannelMessage)
  notify()
}

export function subscribeToTokenChanges(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export async function withRefreshLock<T>(
  callback: () => Promise<T>,
): Promise<T> {
  if (navigator.locks) {
    return navigator.locks.request(REFRESH_LOCK_NAME, callback)
  }

  return callback()
}

import { env } from '@/lib/env'
import { ApiError } from './errors'

/**
 * Token provider. Set by the auth store at boot time to break the
 * circular dependency between the api client and the auth store.
 */
type TokenProvider = () => string | null
type RefreshFn = () => Promise<boolean>
type LogoutFn = () => void

let getToken: TokenProvider = () => null
let refreshFn: RefreshFn | null = null
let logoutFn: LogoutFn | null = null

export function configureApiClient(opts: {
  getToken: TokenProvider
  refresh: RefreshFn
  onAuthLost: LogoutFn
}): void {
  getToken = opts.getToken
  refreshFn = opts.refresh
  logoutFn = opts.onAuthLost
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  /** When false, skips Authorization header AND skips 401 refresh loop. */
  auth?: boolean
  headers?: Record<string, string>
}

/**
 * Typed JSON request. Handles:
 *  - Authorization header (when auth !== false)
 *  - 401 → single-flight refresh → retry once
 *  - JSON encoding/decoding
 *  - ApiError normalization
 */
export async function request<T = unknown>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  return doRequest<T>(path, opts, false)
}

async function doRequest<T>(
  path: string,
  opts: RequestOptions,
  isRetry: boolean
): Promise<T> {
  const { method = 'GET', body, signal, auth = true, headers = {} } = opts

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  }
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json'

  if (auth) {
    const token = getToken()
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${env.VITE_API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include', // for HttpOnly refresh cookie
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      0,
      'NETWORK_ERROR'
    )
  }

  if (res.status === 401 && auth && !isRetry && refreshFn) {
    const refreshed = await refreshFn()
    if (refreshed) {
      return doRequest<T>(path, opts, true)
    }
    // refresh failed — hard logout
    if (logoutFn) logoutFn()
    throw await ApiError.fromResponse(res)
  }

  if (!res.ok) throw await ApiError.fromResponse(res)

  // 204 No Content
  if (res.status === 204) return undefined as T

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return (await res.json()) as T
  }
  return (await res.text()) as unknown as T
}

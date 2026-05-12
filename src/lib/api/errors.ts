/**
 * Normalized API error. Always thrown from the api client on non-2xx.
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly code: string | undefined
  public readonly details: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: unknown = null
    const contentType = res.headers.get('content-type') ?? ''
    try {
      body = contentType.includes('application/json') ? await res.json() : await res.text()
    } catch {
      body = null
    }

    const message =
      (isRecord(body) && typeof body.message === 'string' && body.message) ||
      (isRecord(body) && typeof body.error === 'string' && body.error) ||
      (typeof body === 'string' && body) ||
      res.statusText ||
      `HTTP ${res.status}`

    const code = isRecord(body) && typeof body.code === 'string' ? body.code : undefined

    return new ApiError(message, res.status, code, body)
  }

  isUnauthorized(): boolean {
    return this.status === 401
  }

  isNetworkError(): boolean {
    return this.status === 0
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

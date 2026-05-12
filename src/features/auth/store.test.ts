import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from './store'
import { authApi } from './api'

vi.mock('./api', () => ({
  authApi: {
    refresh: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}))

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockedRefresh = vi.mocked(authApi.refresh)

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    status: 'idle',
    refreshPromise: null,
  })
  mockedRefresh.mockReset()
})

describe('auth store', () => {
  it('setSession populates user, token, and authenticated status', () => {
    useAuthStore.getState().setSession({
      user: { id: 'u1', email: 'a@b.com', name: 'A' },
      accessToken: 'tok',
    })
    const s = useAuthStore.getState()
    expect(s.user?.email).toBe('a@b.com')
    expect(s.accessToken).toBe('tok')
    expect(s.status).toBe('authenticated')
  })

  it('clearSession resets state to unauthenticated', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'a@b.com', name: 'A' },
      accessToken: 'tok',
      status: 'authenticated',
    })
    useAuthStore.getState().clearSession()
    const s = useAuthStore.getState()
    expect(s.user).toBeNull()
    expect(s.accessToken).toBeNull()
    expect(s.status).toBe('unauthenticated')
  })

  it('refresh is single-flight: concurrent calls share one promise', async () => {
    let resolve: (v: {
      user: { id: string; email: string; name: string }
      accessToken: string
    }) => void = () => {}
    mockedRefresh.mockReturnValue(
      new Promise((r) => {
        resolve = r
      })
    )

    const p1 = useAuthStore.getState().refresh()
    const p2 = useAuthStore.getState().refresh()
    const p3 = useAuthStore.getState().refresh()

    // All three calls share the same in-flight promise.
    expect(p1).toBe(p2)
    expect(p2).toBe(p3)

    resolve({
      user: { id: 'u1', email: 'a@b.com', name: 'A' },
      accessToken: 'newtok',
    })

    const results = await Promise.all([p1, p2, p3])
    expect(results).toEqual([true, true, true])
    expect(mockedRefresh).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().accessToken).toBe('newtok')
  })

  it('refresh failure resets state and returns false', async () => {
    mockedRefresh.mockRejectedValue(new Error('nope'))
    const ok = await useAuthStore.getState().refresh()
    expect(ok).toBe(false)
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('refreshPromise is cleared after settlement so subsequent refreshes can run', async () => {
    mockedRefresh.mockResolvedValueOnce({
      user: { id: 'u1', email: 'a@b.com', name: 'A' },
      accessToken: 't1',
    })
    await useAuthStore.getState().refresh()
    expect(useAuthStore.getState().refreshPromise).toBeNull()

    mockedRefresh.mockResolvedValueOnce({
      user: { id: 'u1', email: 'a@b.com', name: 'A' },
      accessToken: 't2',
    })
    await useAuthStore.getState().refresh()
    expect(useAuthStore.getState().accessToken).toBe('t2')
    expect(mockedRefresh).toHaveBeenCalledTimes(2)
  })
})

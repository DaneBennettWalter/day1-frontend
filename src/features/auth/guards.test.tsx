import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth, RedirectIfAuthed } from './guards'
import { useAuthStore } from './store'

function renderWithRouter(initialPath: string, element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
        <Route path="/dashboard" element={<div>DASHBOARD PAGE</div>} />
        <Route path="/protected" element={element} />
        <Route path="/public" element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    status: 'idle',
    refreshPromise: null,
  })
})

describe('<RequireAuth>', () => {
  it('renders a spinner while status is loading', () => {
    useAuthStore.setState({ status: 'loading' })
    renderWithRouter('/protected', <RequireAuth>secret</RequireAuth>)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'a@b.com', name: 'A' },
      accessToken: 't',
      status: 'authenticated',
    })
    renderWithRouter('/protected', <RequireAuth>SECRET</RequireAuth>)
    expect(screen.getByText('SECRET')).toBeInTheDocument()
  })

  it('redirects to /login when unauthenticated', () => {
    useAuthStore.setState({ status: 'unauthenticated' })
    renderWithRouter('/protected', <RequireAuth>SECRET</RequireAuth>)
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument()
    expect(screen.queryByText('SECRET')).not.toBeInTheDocument()
  })
})

describe('<RedirectIfAuthed>', () => {
  it('redirects authenticated users to /dashboard', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'a@b.com', name: 'A' },
      accessToken: 't',
      status: 'authenticated',
    })
    renderWithRouter('/public', <RedirectIfAuthed>PUBLIC</RedirectIfAuthed>)
    expect(screen.getByText('DASHBOARD PAGE')).toBeInTheDocument()
  })

  it('renders children when unauthenticated', () => {
    useAuthStore.setState({ status: 'unauthenticated' })
    renderWithRouter('/public', <RedirectIfAuthed>PUBLIC</RedirectIfAuthed>)
    expect(screen.getByText('PUBLIC')).toBeInTheDocument()
  })
})

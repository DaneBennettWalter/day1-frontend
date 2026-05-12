import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Composer } from './Composer'

describe('<Composer>', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('sends on Enter (no shift)', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<Composer sessionId="s1" onSend={onSend} />)
    const ta = screen.getByLabelText('Message')
    await user.type(ta, 'hello{Enter}')
    expect(onSend).toHaveBeenCalledWith('hello')
  })

  it('does not send on Shift+Enter (inserts newline)', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<Composer sessionId="s1" onSend={onSend} />)
    const ta = screen.getByLabelText('Message')
    await user.type(ta, 'line1{Shift>}{Enter}{/Shift}line2')
    expect(onSend).not.toHaveBeenCalled()
    expect((ta as HTMLTextAreaElement).value).toBe('line1\nline2')
  })

  it('disables send button while empty or streaming', () => {
    const onSend = vi.fn()
    const { rerender } = render(<Composer sessionId="s1" onSend={onSend} />)
    const sendBtn = screen.getByRole('button', { name: /send message/i })
    expect(sendBtn).toBeDisabled()

    rerender(<Composer sessionId="s1" onSend={onSend} isStreaming />)
    // While streaming, the Send button is replaced by Stop.
    expect(screen.queryByRole('button', { name: /send message/i })).toBeNull()
    expect(
      screen.getByRole('button', { name: /stop generating/i })
    ).toBeInTheDocument()
  })

  it('clears draft on Escape', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<Composer sessionId="s1" onSend={onSend} />)
    const ta = screen.getByLabelText('Message')
    await user.type(ta, 'draft text{Escape}')
    expect((ta as HTMLTextAreaElement).value).toBe('')
  })

  it('persists draft to sessionStorage per session', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<Composer sessionId="session-A" onSend={onSend} />)
    const ta = screen.getByLabelText('Message')
    await user.type(ta, 'a draft')
    expect(window.sessionStorage.getItem('day1.aiChat.draft.session-A')).toBe(
      'a draft'
    )
  })

  it('restores draft when switching back to a session', () => {
    const onSend = vi.fn()
    window.sessionStorage.setItem('day1.aiChat.draft.session-B', 'remembered')
    render(<Composer sessionId="session-B" onSend={onSend} />)
    const ta = screen.getByLabelText('Message')
    expect((ta as HTMLTextAreaElement).value).toBe('remembered')
  })
})

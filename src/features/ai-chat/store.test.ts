import { describe, it, expect, beforeEach } from 'vitest'
import { useAiChatStore, __resetAiChatStore } from './store'

describe('useAiChatStore', () => {
  beforeEach(() => {
    __resetAiChatStore()
  })

  it('creates a session and marks it active', () => {
    const id = useAiChatStore.getState().createSession()
    const state = useAiChatStore.getState()
    expect(state.activeSessionId).toBe(id)
    expect(state.sessions).toHaveLength(1)
    expect(state.sessions[0]?.title).toBe('New conversation')
    expect(state.sessions[0]?.messages).toEqual([])
  })

  it('derives session title from the first user message', () => {
    const id = useAiChatStore.getState().createSession()
    const msg = useAiChatStore
      .getState()
      .makeMessage('user', 'Estimate a 200 sq ft kitchen tile job please')
    useAiChatStore.getState().appendMessage(id, msg)
    const session = useAiChatStore.getState().sessions.find((s) => s.id === id)
    expect(session?.title).toBe('Estimate a 200 sq ft kitchen tile job please')
  })

  it('truncates long first-message titles', () => {
    const id = useAiChatStore.getState().createSession()
    const long = 'a'.repeat(200)
    const msg = useAiChatStore.getState().makeMessage('user', long)
    useAiChatStore.getState().appendMessage(id, msg)
    const session = useAiChatStore.getState().sessions.find((s) => s.id === id)
    expect(session?.title.length).toBeLessThanOrEqual(60)
    expect(session?.title.endsWith('…')).toBe(true)
  })

  it('appendDelta concatenates content for streaming', () => {
    const id = useAiChatStore.getState().createSession()
    const msg = useAiChatStore
      .getState()
      .makeMessage('assistant', '', 'streaming')
    useAiChatStore.getState().appendMessage(id, msg)
    useAiChatStore.getState().appendDelta(id, msg.id, 'Hel')
    useAiChatStore.getState().appendDelta(id, msg.id, 'lo, ')
    useAiChatStore.getState().appendDelta(id, msg.id, 'world!')
    const session = useAiChatStore.getState().sessions.find((s) => s.id === id)
    expect(session?.messages[0]?.content).toBe('Hello, world!')
  })

  it('updateMessage patches status', () => {
    const id = useAiChatStore.getState().createSession()
    const msg = useAiChatStore
      .getState()
      .makeMessage('assistant', '', 'streaming')
    useAiChatStore.getState().appendMessage(id, msg)
    useAiChatStore.getState().updateMessage(id, msg.id, { status: 'sent' })
    const session = useAiChatStore.getState().sessions.find((s) => s.id === id)
    expect(session?.messages[0]?.status).toBe('sent')
  })

  it('clearActive empties the active session messages', () => {
    const id = useAiChatStore.getState().createSession()
    useAiChatStore
      .getState()
      .appendMessage(id, useAiChatStore.getState().makeMessage('user', 'hi'))
    useAiChatStore.getState().clearActive()
    const session = useAiChatStore.getState().sessions.find((s) => s.id === id)
    expect(session?.messages).toEqual([])
    expect(session?.title).toBe('New conversation')
  })

  it('deleteSession removes a session and reassigns active when needed', () => {
    const a = useAiChatStore.getState().createSession()
    const b = useAiChatStore.getState().createSession()
    expect(useAiChatStore.getState().activeSessionId).toBe(b)
    useAiChatStore.getState().deleteSession(b)
    const state = useAiChatStore.getState()
    expect(state.sessions.map((s) => s.id)).toEqual([a])
    expect(state.activeSessionId).toBe(a)
  })

  it('deleteSession leaves active alone when deleting a non-active session', () => {
    const a = useAiChatStore.getState().createSession()
    const b = useAiChatStore.getState().createSession()
    useAiChatStore.getState().deleteSession(a)
    expect(useAiChatStore.getState().activeSessionId).toBe(b)
  })

  it('selectSession switches active when target exists', () => {
    const a = useAiChatStore.getState().createSession()
    const b = useAiChatStore.getState().createSession()
    useAiChatStore.getState().selectSession(a)
    expect(useAiChatStore.getState().activeSessionId).toBe(a)
    useAiChatStore.getState().selectSession('does-not-exist')
    expect(useAiChatStore.getState().activeSessionId).toBe(a)
    // suppress unused
    void b
  })
})

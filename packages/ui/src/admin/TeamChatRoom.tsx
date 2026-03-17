'use client'

import { useState, useEffect, useMemo } from 'react'
import type { ChatRoom, TeamMessage } from './services/teamChatTypes'
import { getRooms, getMessages, sendMessage } from './services/teamChatService'
import { useAsyncData } from '../hooks/useAsyncData'

export default function TeamChatRoom() {
  const { data: rooms, loading } = useAsyncData<ChatRoom[]>(() => getRooms(), [])
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<TeamMessage[]>([])
  const [input, setInput] = useState('')

  // Derive active room: user selection or first room
  const activeRoom = useMemo(
    () => selectedRoom ?? (rooms && rooms.length > 0 ? rooms[0].id : null),
    [selectedRoom, rooms],
  )

  // Fetch messages when active room changes
  useEffect(() => {
    if (!activeRoom) return
    getMessages(activeRoom).then(setMessages)
  }, [activeRoom])

  const handleSend = async () => {
    if (!input.trim() || !activeRoom) return
    const msg = await sendMessage(activeRoom, input)
    setMessages((prev) => [...prev, msg])
    setInput('')
  }

  if (loading || !rooms)
    return <div className="p-8 text-center text-text-secondary">채팅 로딩 중...</div>

  const room = rooms.find((r) => r.id === activeRoom)

  return (
    <div className="flex h-[600px] rounded-xl border border-border overflow-hidden">
      {/* Room List */}
      <div className="w-72 border-r border-border bg-admin-bg-section flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-text-primary">팀 채팅</h2>
          <p className="text-xs text-text-secondary mt-0.5">{rooms.length}개 채팅방</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoom(r.id)}
              className={`w-full text-left p-3 border-b border-border-light transition-colors ${activeRoom === r.id ? 'bg-admin-teal/10' : 'hover:bg-bg-hover'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary truncate">{r.name}</span>
                {r.unreadCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-admin-teal text-white text-[10px] font-bold">
                    {r.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary mt-0.5 truncate">
                {r.members.length}명 참여
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-admin-bg-card">
        {room && (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">{room.name}</h3>
                <div className="flex gap-1 mt-1">
                  {room.members.slice(0, 4).map((m) => (
                    <span
                      key={m.userId}
                      className={`w-2 h-2 rounded-full ${m.status === 'online' ? 'bg-green-500' : m.status === 'away' ? 'bg-yellow-500' : 'bg-gray-300'}`}
                      title={`${m.name} (${m.status})`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-admin-bg-section text-text-secondary">
                {room.type}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'system' ? 'justify-center' : 'gap-3'}`}
                >
                  {msg.type === 'system' ? (
                    <span className="text-xs text-text-tertiary bg-admin-bg-section px-3 py-1 rounded-full">
                      {msg.content}
                    </span>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-admin-teal flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {msg.userName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text-primary">
                            {msg.userName}
                          </span>
                          <span className="text-[10px] text-text-tertiary">
                            {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {msg.type === 'ai-response' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                              AI
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-primary mt-0.5">{msg.content}</p>
                        {msg.attachments.length > 0 &&
                          msg.attachments.map((a) => (
                            <div key={a.id} className="mt-1 text-xs text-admin-teal">
                              📎 {a.name}
                            </div>
                          ))}
                        {msg.reactions.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {msg.reactions.map((r, i) => (
                              <span
                                key={i}
                                className="text-xs px-1.5 py-0.5 rounded-full bg-admin-bg-section"
                              >
                                {r.emoji} {r.userIds.length}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="메시지 입력..."
                aria-label="채팅 메시지"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-admin-bg-card text-text-primary"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-4 py-2 rounded-lg bg-admin-teal text-white text-sm disabled:opacity-50"
              >
                전송
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

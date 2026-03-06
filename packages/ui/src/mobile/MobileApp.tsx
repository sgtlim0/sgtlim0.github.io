'use client'

import {
  useMobileTabs,
  useChatList,
  useAssistants,
  useMobileSettings,
} from './services/mobileHooks'
import MobileHeader from './MobileHeader'
import MobileTabBar from './MobileTabBar'
import MobileChatList from './MobileChatList'
import MobileAssistantList from './MobileAssistantList'
import MobileSettingsPage from './MobileSettingsPage'

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function HistoryView() {
  const { chats } = useChatList()

  const grouped: Record<string, typeof chats> = {}
  for (const chat of chats) {
    const key = formatDate(chat.timestamp)
    grouped[key] = [...(grouped[key] ?? []), chat]
  }

  const entries = Object.entries(grouped).sort(
    (a, b) => (b[1][0]?.timestamp ?? 0) - (a[1][0]?.timestamp ?? 0),
  )

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)]">
          <p className="text-sm">대화 기록이 없습니다</p>
        </div>
      ) : (
        entries.map(([date, items]) => (
          <div key={date} className="mb-4">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">{date}</h3>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]"
                >
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                    {item.lastMessage}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function MobileApp() {
  const { activeTab, setActiveTab } = useMobileTabs()
  const { chats, deleteChat } = useChatList()
  const { assistants, toggleFavorite } = useAssistants()
  const { settings, updateSetting } = useMobileSettings()

  const handleSelectChat = () => {
    // Navigate to chat view (handled by parent)
  }

  const handleStartAssistant = () => {
    // Start new conversation with assistant (handled by parent)
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      <MobileHeader />

      {/* Content area with padding for fixed header/tab bar */}
      <main className="flex-1 overflow-hidden pt-[52px] pb-[68px]">
        {activeTab === 'chat' && (
          <MobileChatList chats={[...chats]} onSelect={handleSelectChat} onDelete={deleteChat} />
        )}
        {activeTab === 'assistants' && (
          <MobileAssistantList
            assistants={assistants}
            onStart={handleStartAssistant}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'settings' && (
          <MobileSettingsPage settings={[...settings]} onUpdate={updateSetting} />
        )}
      </main>

      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

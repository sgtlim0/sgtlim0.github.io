'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { ArrowLeft, Search, Square, Plus, Globe, WifiOff } from 'lucide-react'
import ChatSidebar from '../components/ChatSidebar'
import ChatSearchBar from '../components/ChatSearchBar'
import AssistantGrid from '../components/AssistantGrid'
import MessageBubble from '../components/MessageBubble'
import StreamingIndicator from '../components/StreamingIndicator'
import CustomAssistantModal from '../components/CustomAssistantModal'
import ChatSearchPanel from '../components/ChatSearchPanel'
import ResearchPanel from '../components/ResearchPanel'
import InstallBanner from '../components/InstallBanner'
import { useAssistants } from '../hooks/useAssistants'
import { useConversations } from '../hooks/useConversations'
import { useChat } from '../hooks/useChat'
import { useResearch } from '../hooks/useResearch'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'

export default function ChatPage() {
  const [chatMode, setChatMode] = useState<'chat' | 'research'>('chat')
  const [showSearchPanel, setShowSearchPanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isOnline } = useNetworkStatus()

  const {
    allAssistants,
    activeTab,
    activeCategory,
    showCustomAssistantModal,
    editingAssistant,
    setActiveTab,
    setActiveCategory,
    handleSaveCustomAssistant,
    handleOpenCustomAssistantModal,
    closeCustomAssistantModal,
  } = useAssistants()

  const {
    conversations,
    currentConversationId,
    currentConversation,
    isLoading,
    setConversations,
    setCurrentConversationId,
    handleNewChat,
    handleSelectConversation,
    handleSelectAssistant,
    handleDeleteConversation,
    addUserMessageAndGetConversationId,
  } = useConversations({ allAssistants, chatMode })

  const { isStreaming, handleSendChatMessage, handleStopStreaming } = useChat({
    conversations,
    setConversations,
  })

  const { isResearching, researchQuery, handleSendResearchMessage } = useResearch({
    setConversations,
  })

  const currentAssistant = useMemo(() => {
    if (!currentConversation) return undefined
    return allAssistants.find((a) => a.id === currentConversation.assistantId)
  }, [currentConversation, allAssistants])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!isOnline) return
      const targetConversationId = addUserMessageAndGetConversationId(content)
      if (chatMode === 'research') {
        handleSendResearchMessage(content, targetConversationId)
      } else {
        handleSendChatMessage(content, targetConversationId)
      }
    },
    [
      isOnline,
      chatMode,
      addUserMessageAndGetConversationId,
      handleSendChatMessage,
      handleSendResearchMessage,
    ],
  )

  const handleToggleSearchPanel = useCallback(() => {
    setShowSearchPanel((prev) => !prev)
  }, [])

  const handleSelectSearchConversation = useCallback(
    (id: string) => {
      setCurrentConversationId(id)
      setShowSearchPanel(false)
    },
    [setCurrentConversationId],
  )

  const handleBack = useCallback(() => {
    setCurrentConversationId(undefined)
  }, [setCurrentConversationId])

  const modeToggle = (size: 'sm' | 'md') => {
    const px = size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2'
    const text = size === 'sm' ? 'text-xs' : 'text-sm'
    return (
      <div className="flex items-center gap-1 bg-[var(--user-bg-section)] rounded-lg p-0.5">
        <button
          onClick={() => setChatMode('chat')}
          className={`${px} rounded-md ${text} font-medium transition-colors ${
            chatMode === 'chat'
              ? 'bg-[var(--user-primary)] text-white'
              : 'text-[var(--user-text-secondary)] hover:text-[var(--user-text-primary)]'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setChatMode('research')}
          className={`${px} rounded-md ${text} font-medium transition-colors ${
            chatMode === 'research'
              ? 'bg-[var(--user-primary)] text-white'
              : 'text-[var(--user-text-secondary)] hover:text-[var(--user-text-primary)]'
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <Globe className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            Research
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-user-bg">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full md:ml-0 relative">
        {!isOnline && (
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-xs font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            오프라인 상태입니다. 이전 대화를 확인할 수 있지만 새 메시지는 전송할 수 없습니다.
          </div>
        )}
        <InstallBanner />
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-sm text-user-text-muted">대화를 불러오는 중...</div>
          </div>
        ) : currentConversation ? (
          <>
            {/* Chat header */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-user-border bg-user-bg">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="p-1.5 rounded-lg text-user-text-secondary hover:bg-user-bg-section transition-colors"
                  aria-label="뒤로가기"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {currentAssistant && (
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-lg"
                      style={{ backgroundColor: currentAssistant.iconColor }}
                    >
                      {currentAssistant.icon}
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-user-text-primary">
                        {currentAssistant.name}
                      </h2>
                      {currentAssistant.model && (
                        <span className="text-xs text-user-text-muted">
                          {currentAssistant.model}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {modeToggle('sm')}
                <button
                  onClick={handleToggleSearchPanel}
                  className="p-1.5 rounded-lg text-user-text-secondary hover:bg-user-bg-section transition-colors"
                  aria-label="검색"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
              {currentConversation.messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-sm text-user-text-muted">
                  메시지를 입력하여 대화를 시작하세요.
                </div>
              )}
              {currentConversation.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={
                    isStreaming &&
                    msg.role === 'assistant' &&
                    msg === currentConversation.messages[currentConversation.messages.length - 1]
                  }
                />
              ))}
              {isStreaming && <StreamingIndicator isStreaming={isStreaming} />}
              {isResearching && <ResearchPanel isSearching={isResearching} query={researchQuery} />}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom input */}
            <div className="shrink-0 px-4 md:px-6 py-4 border-t border-user-border bg-user-bg">
              {isStreaming && (
                <div className="mb-3 flex justify-center">
                  <button
                    onClick={handleStopStreaming}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-user-bg-section text-user-text-primary hover:bg-user-border transition-colors text-sm font-medium"
                  >
                    <Square className="w-4 h-4" />
                    응답 중지
                  </button>
                </div>
              )}
              <ChatSearchBar onSubmit={handleSendMessage} onAttach={() => {}} />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
              <div className="flex justify-center mb-6">{modeToggle('md')}</div>

              <div className="text-center mb-8 md:mb-10">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-user-text-primary leading-snug mb-3">
                  {chatMode === 'research' ? (
                    <>
                      웹 검색으로
                      <br className="hidden sm:block" />
                      <span className="text-user-primary">최신 정보</span>를 찾아드려요
                    </>
                  ) : (
                    <>
                      실시간 검색, 사진 이해,
                      <br className="hidden sm:block" />
                      그림/차트 생성까지
                      <br className="hidden sm:block" />
                      <span className="text-user-primary">업무 비서</span>가 도와드려요
                    </>
                  )}
                </h1>
              </div>

              <div className="mb-8 md:mb-12">
                <ChatSearchBar onSubmit={handleSendMessage} onAttach={() => {}} />
              </div>

              <div className="mb-6 flex justify-end">
                <button
                  onClick={handleOpenCustomAssistantModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-user-primary text-white hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  커스텀 비서 만들기
                </button>
              </div>

              <AssistantGrid
                assistants={allAssistants}
                activeTab={activeTab}
                activeCategory={activeCategory}
                onTabChange={setActiveTab}
                onCategoryChange={setActiveCategory}
                onSelectAssistant={handleSelectAssistant}
              />
            </div>
          </div>
        )}

        {showSearchPanel && (
          <ChatSearchPanel
            conversations={conversations}
            onSelectConversation={handleSelectSearchConversation}
            onClose={handleToggleSearchPanel}
          />
        )}
      </main>

      <CustomAssistantModal
        isOpen={showCustomAssistantModal}
        onClose={closeCustomAssistantModal}
        onSave={handleSaveCustomAssistant}
        editingAssistant={editingAssistant}
      />
    </div>
  )
}

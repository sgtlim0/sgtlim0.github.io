'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ChatSidebar from '../components/ChatSidebar';
import ChatSearchBar from '../components/ChatSearchBar';
import AssistantGrid from '../components/AssistantGrid';
import { mockAssistants, mockConversations } from '../services/mockData';
import type { Assistant, AssistantCategory, Conversation, ChatMessage } from '../services/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={[
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start',
      ].join(' ')}
    >
      <div
        className={[
          'max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-[#4F6EF7] text-white rounded-br-md'
            : 'bg-[#F8FAFC] dark:bg-gray-800 text-[#1E293B] dark:text-gray-200 rounded-bl-md',
        ].join(' ')}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official');
  const [activeCategory, setActiveCategory] = useState<AssistantCategory>('전체');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === currentConversationId),
    [conversations, currentConversationId]
  );

  const currentAssistant = useMemo(() => {
    if (!currentConversation) return undefined;
    return mockAssistants.find((a) => a.id === currentConversation.assistantId);
  }, [currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleNewChat = useCallback(() => {
    setCurrentConversationId(undefined);
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const handleSelectAssistant = useCallback(
    (assistant: Assistant) => {
      const now = new Date().toISOString();
      const newConversation: Conversation = {
        id: generateId(),
        title: `${assistant.name}와의 대화`,
        assistantId: assistant.id,
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
    },
    []
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!currentConversationId) {
        const defaultAssistant = mockAssistants[0];
        const now = new Date().toISOString();
        const userMessage: ChatMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: now,
        };
        const newConversation: Conversation = {
          id: generateId(),
          title: content.length > 30 ? `${content.slice(0, 30)}...` : content,
          assistantId: defaultAssistant.id,
          messages: [userMessage],
          createdAt: now,
          updatedAt: now,
        };
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversationId(newConversation.id);
        return;
      }

      const now = new Date().toISOString();
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: now,
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, userMessage],
                updatedAt: now,
              }
            : conv
        )
      );

      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: '네, 말씀해주신 내용을 확인했습니다. 도움을 드리겠습니다.',
          timestamp: new Date().toISOString(),
        };
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  updatedAt: new Date().toISOString(),
                }
              : conv
          )
        );
      }, 800);
    },
    [currentConversationId]
  );

  const handleBack = useCallback(() => {
    setCurrentConversationId(undefined);
  }, []);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {currentConversation ? (
          <>
            {/* Chat header */}
            <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-gray-900">
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-gray-800 transition-colors"
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
                    <h2 className="text-sm font-semibold text-[#1E293B] dark:text-white">
                      {currentAssistant.name}
                    </h2>
                    {currentAssistant.model && (
                      <span className="text-xs text-[#94A3B8]">
                        {currentAssistant.model}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {currentConversation.messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-sm text-[#94A3B8]">
                  메시지를 입력하여 대화를 시작하세요.
                </div>
              )}
              {currentConversation.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom input */}
            <div className="shrink-0 px-6 py-4 border-t border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-gray-900">
              <ChatSearchBar onSubmit={handleSendMessage} onAttach={() => {}} />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-12 lg:pl-0">
              {/* Hero */}
              <div className="text-center mb-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] dark:text-white leading-snug mb-3">
                  실시간 검색, 사진 이해,
                  <br />
                  그림/차트 생성까지
                  <br />
                  <span className="text-[#4F6EF7]">업무 비서</span>가 도와드려요
                </h1>
              </div>

              {/* Search bar */}
              <div className="mb-12">
                <ChatSearchBar onSubmit={handleSendMessage} onAttach={() => {}} />
              </div>

              {/* Assistant grid */}
              <AssistantGrid
                assistants={mockAssistants}
                activeTab={activeTab}
                activeCategory={activeCategory}
                onTabChange={setActiveTab}
                onCategoryChange={setActiveCategory}
                onSelectAssistant={handleSelectAssistant}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

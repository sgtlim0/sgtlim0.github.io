'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Square, Plus } from 'lucide-react';
import ChatSidebar from '../components/ChatSidebar';
import ChatSearchBar from '../components/ChatSearchBar';
import AssistantGrid from '../components/AssistantGrid';
import MessageBubble from '../components/MessageBubble';
import StreamingIndicator from '../components/StreamingIndicator';
import CustomAssistantModal from '../components/CustomAssistantModal';
import ChatSearchPanel from '../components/ChatSearchPanel';
import { mockAssistants, mockConversations } from '../services/mockData';
import { streamResponse } from '../services/sseService';
import { getConversations, saveConversations, createConversation, addMessage } from '../services/chatService';
import { getCustomAssistants, saveCustomAssistant } from '../services/assistantService';
import type { Assistant, AssistantCategory, Conversation, ChatMessage } from '../services/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'official' | 'custom'>('official');
  const [activeCategory, setActiveCategory] = useState<AssistantCategory>('전체');
  const [customAssistants, setCustomAssistants] = useState<Assistant[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCustomAssistantModal, setShowCustomAssistantModal] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | undefined>();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<{ abort: () => void } | null>(null);

  // Load conversations and custom assistants on mount
  useEffect(() => {
    const loadedConversations = getConversations();
    setConversations(loadedConversations.length > 0 ? loadedConversations : mockConversations);

    const loadedCustomAssistants = getCustomAssistants();
    setCustomAssistants(loadedCustomAssistants);
  }, []);

  // Save conversations to localStorage on every change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const allAssistants = useMemo(
    () => [...mockAssistants, ...customAssistants],
    [customAssistants]
  );

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === currentConversationId),
    [conversations, currentConversationId]
  );

  const currentAssistant = useMemo(() => {
    if (!currentConversation) return undefined;
    return allAssistants.find((a) => a.id === currentConversation.assistantId);
  }, [currentConversation, allAssistants]);

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

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(undefined);
    }
  }, [currentConversationId]);

  const handleSendMessage = useCallback(
    (content: string) => {
      let targetConversationId = currentConversationId;

      if (!targetConversationId) {
        const defaultAssistant = allAssistants[0];
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
        targetConversationId = newConversation.id;
      } else {
        const now = new Date().toISOString();
        const userMessage: ChatMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: now,
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === targetConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, userMessage],
                  updatedAt: now,
                }
              : conv
          )
        );
      }

      // Start streaming response
      const conversation = conversations.find(c => c.id === targetConversationId) ||
                           { assistantId: allAssistants[0].id };
      const assistantId = conversation.assistantId;

      setIsStreaming(true);
      const assistantMessageId = generateId();
      const now = new Date().toISOString();

      // Create initial empty assistant message
      const initialAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: now,
        assistantId,
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === targetConversationId
            ? {
                ...conv,
                messages: [...conv.messages, initialAssistantMessage],
                updatedAt: now,
              }
            : conv
        )
      );

      const stream = streamResponse(content, assistantId);
      abortControllerRef.current = stream;

      stream.subscribe(
        (chunk: string) => {
          // Accumulate chunks into the assistant message
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === targetConversationId
                ? {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: msg.content + chunk }
                        : msg
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : conv
            )
          );
        },
        () => {
          // onDone
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        (error: Error) => {
          // onError
          console.error('Streaming error:', error);
          setIsStreaming(false);
          abortControllerRef.current = null;

          // Update message with error
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === targetConversationId
                ? {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: msg.content || '응답을 생성하는 중 오류가 발생했습니다.' }
                        : msg
                    ),
                  }
                : conv
            )
          );
        }
      );
    },
    [currentConversationId, conversations, allAssistants]
  );

  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, []);

  const handleSaveCustomAssistant = useCallback((assistantData: Omit<Assistant, 'id' | 'isOfficial'>) => {
    const assistant: Assistant = {
      ...assistantData,
      id: editingAssistant?.id || generateId(),
      isOfficial: false,
    };
    saveCustomAssistant(assistant);
    setCustomAssistants(getCustomAssistants());
    setShowCustomAssistantModal(false);
    setEditingAssistant(undefined);
  }, [editingAssistant]);

  const handleOpenCustomAssistantModal = useCallback(() => {
    setEditingAssistant(undefined);
    setShowCustomAssistantModal(true);
  }, []);

  const handleToggleSearchPanel = useCallback(() => {
    setShowSearchPanel((prev) => !prev);
  }, []);

  const handleSelectSearchConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
    setShowSearchPanel(false);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentConversationId(undefined);
  }, []);

  return (
    <div className="flex h-screen bg-user-bg">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-full md:ml-0 relative">
        {currentConversation ? (
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
              <button
                onClick={handleToggleSearchPanel}
                className="p-1.5 rounded-lg text-user-text-secondary hover:bg-user-bg-section transition-colors"
                aria-label="검색"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
              {currentConversation.messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-sm text-user-text-muted">
                  메시지를 입력하여 대화를 시작하세요.
                </div>
              )}
              {currentConversation.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isStreaming={isStreaming && msg.role === 'assistant' && msg === currentConversation.messages[currentConversation.messages.length - 1]} />
              ))}
              {isStreaming && <StreamingIndicator isStreaming={isStreaming} />}
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
              {/* Hero */}
              <div className="text-center mb-8 md:mb-10">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-user-text-primary leading-snug mb-3">
                  실시간 검색, 사진 이해,
                  <br className="hidden sm:block" />
                  그림/차트 생성까지
                  <br className="hidden sm:block" />
                  <span className="text-user-primary">업무 비서</span>가 도와드려요
                </h1>
              </div>

              {/* Search bar */}
              <div className="mb-8 md:mb-12">
                <ChatSearchBar onSubmit={handleSendMessage} onAttach={() => {}} />
              </div>

              {/* Custom assistant button */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={handleOpenCustomAssistantModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-user-primary text-white hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  커스텀 비서 만들기
                </button>
              </div>

              {/* Assistant grid */}
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

        {/* Search panel */}
        {showSearchPanel && (
          <ChatSearchPanel
            conversations={conversations}
            onSelectConversation={handleSelectSearchConversation}
            onClose={handleToggleSearchPanel}
          />
        )}
      </main>

      {/* Custom assistant modal */}
      <CustomAssistantModal
        isOpen={showCustomAssistantModal}
        onClose={() => {
          setShowCustomAssistantModal(false);
          setEditingAssistant(undefined);
        }}
        onSave={handleSaveCustomAssistant}
        editingAssistant={editingAssistant}
      />
    </div>
  );
}

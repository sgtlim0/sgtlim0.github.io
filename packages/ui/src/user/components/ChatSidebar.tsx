'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, MessageSquare, User, BookOpen, LogOut, Menu, X } from 'lucide-react';
import type { Conversation } from '../services/types';

export interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function SidebarContent({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onClose,
}: ChatSidebarProps & { onClose?: () => void }) {
  const sortedConversations = useMemo(
    () =>
      [...conversations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [conversations]
  );

  return (
    <nav aria-label="대화 목록 네비게이션" className="flex flex-col h-full w-[280px] md:w-16 lg:w-[280px] bg-user-bg border-r border-user-border transition-all duration-300">
      {/* Header */}
      <div className="p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-user-text-primary md:hidden lg:block">
            대화 목록
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-user-text-secondary hover:bg-user-bg-section transition-colors lg:hidden"
              aria-label="사이드바 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-user-primary border border-user-primary hover:bg-user-primary-light transition-colors"
          title="새 대화 시작"
        >
          <Plus className="w-4 h-4" />
          <span className="md:hidden lg:inline">새 대화 시작</span>
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2">
        {sortedConversations.map((conv) => {
          const isActive = conv.id === activeConversationId;
          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={[
                'flex items-start gap-3 w-full px-3 py-3 rounded-lg text-left transition-colors mb-0.5',
                isActive
                  ? 'bg-user-primary-light'
                  : 'hover:bg-user-bg-section',
              ].join(' ')}
              title={conv.title}
              aria-label={`대화 선택: ${conv.title}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <MessageSquare
                className={[
                  'w-4 h-4 mt-0.5 shrink-0',
                  isActive ? 'text-user-primary' : 'text-user-text-muted',
                ].join(' ')}
              />
              <div className="flex-1 min-w-0 md:hidden lg:block">
                <p
                  className={[
                    'text-sm truncate',
                    isActive
                      ? 'font-semibold text-user-primary'
                      : 'font-medium text-user-text-primary',
                  ].join(' ')}
                >
                  {conv.title}
                </p>
                <span className="text-xs text-user-text-muted">
                  {formatDate(conv.updatedAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-user-border p-4 space-y-1">
        <SidebarLink icon={User} label="내 계정 관리" />
        <SidebarLink icon={BookOpen} label="이용 매뉴얼" />
        <SidebarLink icon={LogOut} label="로그아웃" />
        <p className="text-xs text-user-text-muted text-center pt-2 md:hidden lg:block">v 2.0</p>
      </div>
    </nav>
  );
}

function SidebarLink({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button
      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-user-text-secondary hover:bg-user-bg-section transition-colors"
      title={label}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="md:hidden lg:inline">{label}</span>
    </button>
  );
}

export default function ChatSidebar(props: ChatSidebarProps) {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={handleToggle}
        className="fixed top-24 left-4 z-50 p-2 rounded-lg bg-user-bg shadow-md border border-user-border md:hidden"
        aria-label="사이드바 열기"
      >
        <Menu className="w-5 h-5 text-user-text-primary" />
      </button>

      {/* Tablet/Desktop sidebar - always visible */}
      <aside className="hidden md:block shrink-0 h-full" role="complementary" aria-label="사이드바">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile overlay sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 z-50 h-full transition-transform duration-300 ease-out" role="complementary" aria-label="사이드바">
            <SidebarContent {...props} onClose={handleClose} />
          </aside>
        </div>
      )}
    </>
  );
}

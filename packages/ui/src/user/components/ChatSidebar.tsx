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
    <div className="flex flex-col h-full w-[280px] bg-white dark:bg-[#1E293B] border-r border-[#E2E8F0] dark:border-gray-700">
      {/* Header */}
      <div className="p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-[#1E293B] dark:text-white">
            대화 목록
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-gray-700 transition-colors lg:hidden"
              aria-label="사이드바 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-[#4F6EF7] border border-[#4F6EF7] hover:bg-[#EBF0FF] dark:hover:bg-[#4F6EF7]/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 대화 시작
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
                  ? 'bg-[#EBF0FF] dark:bg-[#4F6EF7]/20'
                  : 'hover:bg-[#F8FAFC] dark:hover:bg-gray-700/50',
              ].join(' ')}
            >
              <MessageSquare
                className={[
                  'w-4 h-4 mt-0.5 shrink-0',
                  isActive ? 'text-[#4F6EF7]' : 'text-[#94A3B8]',
                ].join(' ')}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={[
                    'text-sm truncate',
                    isActive
                      ? 'font-semibold text-[#4F6EF7] dark:text-[#4F6EF7]'
                      : 'font-medium text-[#1E293B] dark:text-gray-200',
                  ].join(' ')}
                >
                  {conv.title}
                </p>
                <span className="text-xs text-[#94A3B8]">
                  {formatDate(conv.updatedAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="shrink-0 border-t border-[#E2E8F0] dark:border-gray-700 p-4 space-y-1">
        <SidebarLink icon={User} label="내 계정 관리" />
        <SidebarLink icon={BookOpen} label="이용 매뉴얼" />
        <SidebarLink icon={LogOut} label="로그아웃" />
        <p className="text-xs text-[#94A3B8] text-center pt-2">v 2.0</p>
      </div>
    </div>
  );
}

function SidebarLink({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-[#64748B] dark:text-gray-400 hover:bg-[#F8FAFC] dark:hover:bg-gray-700/50 transition-colors">
      <Icon className="w-4 h-4" />
      {label}
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
      {/* Mobile toggle */}
      <button
        onClick={handleToggle}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-[#1E293B] shadow-md border border-[#E2E8F0] dark:border-gray-700 lg:hidden"
        aria-label="사이드바 열기"
      >
        <Menu className="w-5 h-5 text-[#1E293B] dark:text-white" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block shrink-0 h-full">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={handleClose}
            aria-hidden="true"
          />
          <aside className="relative z-50 h-full animate-slide-in-left">
            <SidebarContent {...props} onClose={handleClose} />
          </aside>
        </div>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Conversation } from '../services/types';

export interface ChatSearchPanelProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onClose: () => void;
}

type DateFilter = '전체' | '오늘' | '이번 주' | '이번 달';

export default function ChatSearchPanel({
  conversations,
  onSelectConversation,
  onClose,
}: ChatSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('전체');

  const getFilteredConversations = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return conversations.filter((conv) => {
      // Date filter
      const convDate = new Date(conv.updatedAt);
      let passDateFilter = false;
      switch (dateFilter) {
        case '전체':
          passDateFilter = true;
          break;
        case '오늘':
          passDateFilter = convDate >= today;
          break;
        case '이번 주':
          passDateFilter = convDate >= weekAgo;
          break;
        case '이번 달':
          passDateFilter = convDate >= monthStart;
          break;
      }
      if (!passDateFilter) return false;

      // Search query
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const titleMatch = conv.title.toLowerCase().includes(query);
      const messageMatch = conv.messages.some((msg) =>
        msg.content.toLowerCase().includes(query)
      );

      return titleMatch || messageMatch;
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300/50 text-[var(--user-text-primary)]">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getMessagePreview = (conv: Conversation, query: string): string => {
    if (!query.trim()) {
      const lastMsg = conv.messages[conv.messages.length - 1];
      return lastMsg?.content.slice(0, 100) || '';
    }

    const matchingMsg = conv.messages.find((msg) =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    if (matchingMsg) {
      const index = matchingMsg.content.toLowerCase().indexOf(query.toLowerCase());
      const start = Math.max(0, index - 40);
      const end = Math.min(matchingMsg.content.length, index + query.length + 60);
      return (start > 0 ? '...' : '') +
        matchingMsg.content.slice(start, end) +
        (end < matchingMsg.content.length ? '...' : '');
    }

    return conv.messages[conv.messages.length - 1]?.content.slice(0, 100) || '';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date >= today) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      return '어제';
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    } else {
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  const filteredConversations = getFilteredConversations();

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[var(--user-bg-main)] shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--user-border)]">
        <h2 className="text-lg font-semibold text-[var(--user-text-primary)]">대화 검색</h2>
        <button
          onClick={onClose}
          className="text-[var(--user-text-secondary)] hover:text-[var(--user-text-primary)] transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-[var(--user-border)]">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--user-text-tertiary)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="대화 내용 검색..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--user-border)] rounded-lg bg-[var(--user-bg-section)] text-[var(--user-text-primary)] placeholder:text-[var(--user-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--user-primary)]"
          />
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex gap-2 p-4 border-b border-[var(--user-border)]">
        {(['전체', '오늘', '이번 주', '이번 달'] as DateFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setDateFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              dateFilter === filter
                ? 'bg-[var(--user-primary)] text-white'
                : 'bg-[var(--user-bg-section)] text-[var(--user-text-secondary)] hover:text-[var(--user-text-primary)]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--user-text-tertiary)]">
            검색 결과가 없습니다
          </div>
        ) : (
          <div className="divide-y divide-[var(--user-border)]">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClose();
                }}
                className="w-full p-4 text-left hover:bg-[var(--user-bg-section)] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-[var(--user-text-primary)] line-clamp-1">
                    {highlightText(conv.title, searchQuery)}
                  </h3>
                  <span className="text-xs text-[var(--user-text-tertiary)] whitespace-nowrap">
                    {formatDate(conv.updatedAt)}
                  </span>
                </div>
                <p className="text-sm text-[var(--user-text-secondary)] line-clamp-2">
                  {highlightText(getMessagePreview(conv, searchQuery), searchQuery)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

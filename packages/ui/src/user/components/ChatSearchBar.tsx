'use client';

import React, { useState, useCallback } from 'react';
import { Search, Paperclip, Send } from 'lucide-react';

export interface ChatSearchBarProps {
  onSubmit: (query: string) => void;
  onAttach?: () => void;
}

export default function ChatSearchBar({ onSubmit, onAttach }: ChatSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
    setQuery('');
  }, [query, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed.length === 0) return;
      onSubmit(trimmed);
      setQuery('');
    }
  }, [query, onSubmit]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative flex items-center bg-user-bg rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-user-border transition-shadow focus-within:shadow-xl focus-within:shadow-black/10">
        {/* Search icon */}
        <div className="pl-4 pr-2 flex items-center shrink-0">
          <Search className="w-5 h-5 text-user-text-muted" />
        </div>

        {/* Input */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="무엇이든 물어보세요..."
          rows={1}
          aria-label="검색 입력"
          className="flex-1 py-4 text-sm text-user-text-primary bg-transparent placeholder-user-text-muted resize-none outline-none leading-snug"
        />

        {/* Action buttons */}
        <div className="flex items-center gap-1 pr-3 shrink-0">
          {onAttach && (
            <button
              type="button"
              onClick={onAttach}
              className="p-2 rounded-lg text-user-text-muted hover:text-user-text-secondary hover:bg-user-bg-section transition-colors"
              aria-label="파일 첨부"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={query.trim().length === 0}
            className={[
              'p-2 rounded-lg transition-colors',
              query.trim().length > 0
                ? 'bg-user-primary text-white hover:bg-user-primary/90'
                : 'bg-user-bg-section text-user-text-muted cursor-not-allowed',
            ].join(' ')}
            aria-label="전송"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Assistant, AssistantCategory } from '../services/types';

export interface CustomAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assistant: Omit<Assistant, 'id' | 'isOfficial'>) => void;
  editingAssistant?: Assistant;
}

const PRESET_EMOJIS = ['🤖', '🧠', '💡', '📝', '🎯', '🔬', '🎨', '📊'];
const PRESET_COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#10B981', // green
  '#F59E0B', // orange
  '#EF4444', // red
];
const MODELS = ['GPT-4o', 'GPT-4.1 nano', 'Claude Sonnet', 'Gemini Pro'];
const CATEGORIES: Exclude<AssistantCategory, '전체'>[] = [
  '채팅',
  '업무',
  '번역',
  '정리',
  '보고',
  '그림',
  '글쓰기',
];

export default function CustomAssistantModal({
  isOpen,
  onClose,
  onSave,
  editingAssistant,
}: CustomAssistantModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🤖');
  const [iconColor, setIconColor] = useState('#3B82F6');
  const [model, setModel] = useState('GPT-4o');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Exclude<AssistantCategory, '전체'>>('채팅');

  useEffect(() => {
    if (editingAssistant) {
      setName(editingAssistant.name);
      setIcon(editingAssistant.icon);
      setIconColor(editingAssistant.iconColor);
      setModel(editingAssistant.model);
      setDescription(editingAssistant.description);
      setCategory(editingAssistant.category as Exclude<AssistantCategory, '전체'>);
    } else {
      setName('');
      setIcon('🤖');
      setIconColor('#3B82F6');
      setModel('GPT-4o');
      setDescription('');
      setCategory('채팅');
    }
  }, [editingAssistant, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      icon,
      iconColor,
      model,
      description: description.trim(),
      category,
    });
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="bg-[var(--user-bg-main)] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--user-border)]">
          <h2 className="text-xl font-semibold text-[var(--user-text-primary)]">
            {editingAssistant ? '비서 수정' : '새 비서 만들기'}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--user-text-secondary)] hover:text-[var(--user-text-primary)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-[var(--user-text-primary)] mb-2">
              이름 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="비서 이름을 입력하세요"
              className="w-full px-4 py-2 border border-[var(--user-border)] rounded-lg bg-[var(--user-bg-section)] text-[var(--user-text-primary)] placeholder:text-[var(--user-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--user-primary)]"
              required
            />
          </div>

          {/* 아이콘 */}
          <div>
            <label className="block text-sm font-medium text-[var(--user-text-primary)] mb-2">
              아이콘
            </label>
            <div className="flex gap-2">
              {PRESET_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                    icon === emoji
                      ? 'border-[var(--user-primary)] bg-[var(--user-primary)]/10'
                      : 'border-[var(--user-border)] bg-[var(--user-bg-section)] hover:border-[var(--user-primary)]/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 아이콘 색상 */}
          <div>
            <label className="block text-sm font-medium text-[var(--user-text-primary)] mb-2">
              아이콘 색상
            </label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setIconColor(color)}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    iconColor === color
                      ? 'border-[var(--user-text-primary)] scale-110'
                      : 'border-[var(--user-border)] hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 모델 선택 */}
          <div>
            <label className="block text-sm font-medium text-[var(--user-text-primary)] mb-2">
              모델 선택
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--user-border)] rounded-lg bg-[var(--user-bg-section)] text-[var(--user-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--user-primary)]"
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* 프롬프트 */}
          <div>
            <label className="block text-sm font-medium text-[var(--user-text-primary)] mb-2">
              프롬프트
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 비서의 역할과 행동 지침을 입력하세요"
              rows={6}
              className="w-full px-4 py-2 border border-[var(--user-border)] rounded-lg bg-[var(--user-bg-section)] text-[var(--user-text-primary)] placeholder:text-[var(--user-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--user-primary)] resize-none"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-[var(--user-text-primary)] mb-2">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Exclude<AssistantCategory, '전체'>)}
              className="w-full px-4 py-2 border border-[var(--user-border)] rounded-lg bg-[var(--user-bg-section)] text-[var(--user-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--user-primary)]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[var(--user-border)]">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-[var(--user-border)] text-[var(--user-text-primary)] hover:bg-[var(--user-bg-section)] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-2 rounded-lg bg-[var(--user-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

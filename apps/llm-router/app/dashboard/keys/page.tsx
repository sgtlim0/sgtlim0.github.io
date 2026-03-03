'use client';

import { useState } from 'react';
import { mockAPIKeys, type APIKey } from '@hchat/ui/llm-router';
import { Plus, Copy, Trash2, Eye, EyeOff, Check } from 'lucide-react';

export default function KeysPage() {
  const [keys, setKeys] = useState<APIKey[]>(mockAPIKeys);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const maskKey = (key: string, revealed: boolean) => {
    if (revealed) return key;
    return `${key.slice(0, 5)}${'*'.repeat(12)}${key.slice(-4)}`;
  };

  const handleCopy = async (id: string, key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    const newKey = `sk-proj-${Math.random().toString(36).slice(2, 22)}`;
    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: newKey,
      created: new Date().toISOString().split('T')[0],
      lastUsed: '-',
      status: 'active'
    };

    setKeys([apiKey, ...keys]);
    setGeneratedKey(newKey);
    setNewKeyName('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setGeneratedKey(null);
    setNewKeyName('');
  };

  const handleToggleStatus = (id: string) => {
    setKeys(
      keys.map((key) =>
        key.id === id
          ? { ...key, status: key.status === 'active' ? 'revoked' : 'active' }
          : key
      )
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 이 API 키를 삭제하시겠습니까?')) {
      setKeys(keys.filter((key) => key.id !== id));
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[var(--lr-text-primary)]">API 키 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--lr-primary)] text-white rounded-lg hover:bg-[var(--lr-primary-hover)] transition-colors"
        >
          <Plus className="w-5 h-5" />새 API 키
        </button>
      </div>

      <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--lr-border)] bg-[var(--lr-bg)]">
                <th className="text-left py-4 px-6 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  이름
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  키
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  생성일
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  마지막 사용
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  상태
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  액션
                </th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-[var(--lr-border)] last:border-0">
                  <td className="py-4 px-6">
                    <span className="font-medium text-[var(--lr-text-primary)]">{key.name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-sm font-mono text-[var(--lr-text-secondary)] bg-[var(--lr-bg)] px-2 py-1 rounded">
                      {maskKey(key.key, revealedIds.has(key.id))}
                    </code>
                  </td>
                  <td className="py-4 px-6 text-[var(--lr-text-secondary)]">{key.created}</td>
                  <td className="py-4 px-6 text-[var(--lr-text-secondary)]">
                    {key.lastUsed || '사용 안 함'}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        key.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {key.status === 'active' ? '활성' : '폐기됨'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleReveal(key.id)}
                        className="p-2 text-[var(--lr-text-secondary)] hover:text-[var(--lr-text-primary)] hover:bg-[var(--lr-bg)] rounded transition-colors"
                        title={revealedIds.has(key.id) ? '숨기기' : '보기'}
                      >
                        {revealedIds.has(key.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(key.id, key.key)}
                        className="p-2 text-[var(--lr-text-secondary)] hover:text-[var(--lr-text-primary)] hover:bg-[var(--lr-bg)] rounded transition-colors"
                        title="복사"
                      >
                        {copiedId === key.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(key.id)}
                        className="px-3 py-1 text-sm text-[var(--lr-text-secondary)] hover:text-[var(--lr-text-primary)] hover:bg-[var(--lr-bg)] rounded transition-colors"
                      >
                        {key.status === 'active' ? '폐기' : '활성화'}
                      </button>
                      <button
                        onClick={() => handleDelete(key.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Key Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--lr-bg)] border border-[var(--lr-border)] rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-[var(--lr-text-primary)] mb-4">
              새 API 키 생성
            </h2>

            {generatedKey ? (
              <div>
                <p className="text-sm text-[var(--lr-text-secondary)] mb-3">
                  API 키가 생성되었습니다. 이 키는 다시 표시되지 않으니 안전한 곳에 보관하세요.
                </p>
                <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-4 mb-4">
                  <code className="text-sm font-mono text-[var(--lr-text-primary)] break-all">
                    {generatedKey}
                  </code>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopy('generated', generatedKey)}
                    className="flex-1 px-4 py-2 bg-[var(--lr-primary)] text-white rounded-lg hover:bg-[var(--lr-primary-hover)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    복사
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-[var(--lr-bg-section)] text-[var(--lr-text-primary)] rounded-lg hover:bg-[var(--lr-border)] transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-[var(--lr-text-primary)] mb-2">
                  키 이름
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="예: Production API Key"
                  className="w-full px-4 py-2 bg-[var(--lr-bg)] border border-[var(--lr-border)] rounded-lg text-[var(--lr-text-primary)] placeholder-[var(--lr-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--lr-primary)] mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 px-4 py-2 bg-[var(--lr-primary)] text-white rounded-lg hover:bg-[var(--lr-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    생성
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-[var(--lr-bg-section)] text-[var(--lr-text-primary)] rounded-lg hover:bg-[var(--lr-border)] transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

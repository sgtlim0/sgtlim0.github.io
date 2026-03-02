'use client';

import { useState } from 'react';
import { Search, Plus, ChevronRight, ChevronDown, Building2, FolderTree, Edit3, Trash2, Users } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  code: string;
  parentCode: string;
  userCount: number;
}

interface TreeNode extends Department {
  children: TreeNode[];
  level: number;
}

const DEPARTMENTS: Department[] = [
  { id: 1, name: '현대자동차', code: 'HMC', parentCode: '', userCount: 156 },
  { id: 2, name: 'DX본부', code: 'DX', parentCode: 'HMC', userCount: 42 },
  { id: 3, name: 'AI연구팀', code: 'AI_TEAM', parentCode: 'DX', userCount: 15 },
  { id: 4, name: '데이터플랫폼팀', code: 'DATA_TEAM', parentCode: 'DX', userCount: 12 },
  { id: 5, name: '기아', code: 'KIA', parentCode: '', userCount: 89 },
  { id: 6, name: 'IT기획팀', code: 'IT_PLAN', parentCode: 'KIA', userCount: 23 },
  { id: 7, name: '현대모비스', code: 'MOBIS', parentCode: '', userCount: 67 },
  { id: 8, name: 'SW개발실', code: 'SW_DEV', parentCode: 'MOBIS', userCount: 18 },
];

export default function DepartmentManagement() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Department | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['HMC', 'DX', 'KIA', 'MOBIS']));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncResults, setShowSyncResults] = useState(false);
  const [newDept, setNewDept] = useState({ code: '', name: '', parentCode: '' });

  const buildTree = (departments: Department[]): TreeNode[] => {
    const map: Record<string, TreeNode> = {};
    const roots: TreeNode[] = [];

    departments.forEach((dept) => {
      map[dept.code] = { ...dept, children: [], level: 0 };
    });

    departments.forEach((dept) => {
      const node = map[dept.code];
      if (dept.parentCode && map[dept.parentCode]) {
        node.level = map[dept.parentCode].level + 1;
        map[dept.parentCode].children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const toggleExpand = (code: string) => {
    const next = new Set(expanded);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setExpanded(next);
  };

  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node) => {
      const isExpanded = expanded.has(node.code);
      const hasChildren = node.children.length > 0;
      const isSelected = selected?.code === node.code;

      return (
        <div key={node.code}>
          <div
            onClick={() => setSelected(node)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              isSelected ? 'bg-admin-teal/10' : 'hover:bg-hmg-bg-hover'
            }`}
            style={{ paddingLeft: `${node.level * 16 + 12}px` }}
          >
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.code);
                }}
                className="flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-text-tertiary" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-tertiary" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}
            {node.level === 0 ? (
              <Building2 className="w-4 h-4 text-admin-teal flex-shrink-0" />
            ) : (
              <FolderTree className="w-4 h-4 text-text-tertiary flex-shrink-0" />
            )}
            <span className="text-sm text-text-primary flex-1 truncate">{node.name}</span>
            <span className="flex items-center gap-1 text-xs text-text-tertiary">
              <Users className="w-3 h-3" />
              {node.userCount}
            </span>
          </div>
          {hasChildren && isExpanded && renderTree(node.children)}
        </div>
      );
    });
  };

  const filtered = query
    ? DEPARTMENTS.filter((d) => d.name.includes(query) || d.code.includes(query))
    : DEPARTMENTS;

  const tree = buildTree(filtered);

  const handleAddDept = () => {
    setShowAddModal(false);
    setNewDept({ code: '', name: '', parentCode: '' });
  };

  const handleSync = () => {
    setShowSyncResults(true);
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">부서 관리</h1>
          <p className="text-sm text-text-secondary mt-1">총 {DEPARTMENTS.length}개 부서</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            className="flex items-center gap-2 px-4 h-11 rounded-lg border border-hmg-border text-sm font-medium text-text-primary hover:bg-hmg-bg-hover transition-colors"
          >
            동기화
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 h-11 rounded-lg bg-admin-teal text-sm font-medium text-white hover:bg-admin-teal/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            부서 추가
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 h-11 rounded-lg border border-border bg-admin-input-bg">
        <Search className="w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="부서명 또는 코드 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-hmg-bg-card rounded-2xl border border-hmg-border p-4">
            <h2 className="text-sm font-semibold text-text-primary mb-4">부서 구조</h2>
            <div className="flex flex-col gap-1">{renderTree(tree)}</div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-hmg-bg-card rounded-2xl border border-hmg-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary">부서 정보</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-hmg-border text-sm text-text-primary hover:bg-hmg-bg-hover transition-colors">
                    <Edit3 className="w-4 h-4" />
                    수정
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-hmg-border text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">부서 코드</div>
                    <div className="text-sm font-medium text-text-primary">{selected.code}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">부서 이름</div>
                    <div className="text-sm font-medium text-text-primary">{selected.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">상위 부서</div>
                    <div className="text-sm font-medium text-text-primary">
                      {selected.parentCode
                        ? DEPARTMENTS.find((d) => d.code === selected.parentCode)?.name || '-'
                        : '최상위'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">소속 사용자 수</div>
                    <div className="text-sm font-medium text-text-primary">{selected.userCount}명</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-tertiary mb-1">생성일</div>
                    <div className="text-sm font-medium text-text-primary">2025-01-15</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-hmg-bg-card rounded-2xl border border-hmg-border p-12 flex flex-col items-center justify-center">
              <FolderTree className="w-12 h-12 text-text-tertiary mb-3" />
              <p className="text-sm text-text-secondary">부서를 선택하면 상세 정보가 표시됩니다</p>
            </div>
          )}
        </div>
      </div>

      {showSyncResults && (
        <div className="bg-hmg-bg-card rounded-2xl border border-hmg-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">동기화 결과</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-sm text-text-secondary">
              성공: <span className="font-medium text-green-500">8건</span>
            </div>
            <div className="text-sm text-text-secondary">
              실패: <span className="font-medium text-red-500">0건</span>
            </div>
          </div>
          <div className="border border-hmg-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-hmg-bg-hover">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">부서 코드</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">부서명</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hmg-border">
                {DEPARTMENTS.map((dept) => (
                  <tr key={dept.code} className="hover:bg-hmg-bg-hover">
                    <td className="px-4 py-3 text-text-primary">{dept.code}</td>
                    <td className="px-4 py-3 text-text-primary">{dept.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                        성공
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-hmg-bg-card rounded-2xl border border-hmg-border p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-text-primary mb-4">부서 추가</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">부서 코드</label>
                <input
                  type="text"
                  value={newDept.code}
                  onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                  className="w-full px-4 h-11 rounded-lg border border-border bg-admin-input-bg text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-admin-teal"
                  placeholder="예: IT_TEAM"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">부서 이름</label>
                <input
                  type="text"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="w-full px-4 h-11 rounded-lg border border-border bg-admin-input-bg text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-admin-teal"
                  placeholder="예: IT기획팀"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">상위 부서</label>
                <select
                  value={newDept.parentCode}
                  onChange={(e) => setNewDept({ ...newDept, parentCode: e.target.value })}
                  className="w-full px-4 h-11 rounded-lg border border-border bg-admin-input-bg text-sm text-text-primary outline-none focus:ring-2 focus:ring-admin-teal"
                >
                  <option value="">최상위</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 h-11 rounded-lg border border-hmg-border text-sm font-medium text-text-primary hover:bg-hmg-bg-hover transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddDept}
                className="flex-1 h-11 rounded-lg bg-admin-teal text-sm font-medium text-white hover:bg-admin-teal/90 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import UserCard from './UserCard';

const USERS = [
  { name: '김철수', userId: 'user01', department: 'AI혁신팀', totalConversations: 245, monthlyTokens: '125,000', status: 'active' as const },
  { name: '이영희', userId: 'user02', department: '개발팀', totalConversations: 189, monthlyTokens: '98,400', status: 'active' as const },
  { name: '박민수', userId: 'user03', department: '디자인팀', totalConversations: 156, monthlyTokens: '67,200', status: 'active' as const },
  { name: '최수진', userId: 'user04', department: '마케팅팀', totalConversations: 12, monthlyTokens: '3,200', status: 'inactive' as const },
  { name: '정대호', userId: 'user05', department: '기획팀', totalConversations: 203, monthlyTokens: '87,600', status: 'active' as const },
  { name: '한지민', userId: 'user06', department: '인사팀', totalConversations: 89, monthlyTokens: '45,100', status: 'active' as const },
];

export default function AdminUserManagement() {
  const [query, setQuery] = useState('');

  const filtered = query
    ? USERS.filter((u) => u.name.includes(query) || u.userId.includes(query))
    : USERS;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">사용자 관리</h1>
          <p className="text-sm text-text-secondary mt-1">총 {USERS.length}명의 사용자</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 h-11 rounded-lg border border-border bg-admin-input-bg">
        <Search className="w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="사용자 이름 또는 ID 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((user) => (
          <UserCard key={user.userId} {...user} />
        ))}
      </div>
    </div>
  );
}

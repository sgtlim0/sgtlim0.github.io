'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import UserCard from './UserCard';
import Pagination from '../Pagination';

const USERS = [
  { name: '김철수', userId: 'user01', department: 'AI혁신팀', totalConversations: 245, monthlyTokens: '125,000', status: 'active' as const },
  { name: '이영희', userId: 'user02', department: '개발팀', totalConversations: 189, monthlyTokens: '98,400', status: 'active' as const },
  { name: '박민수', userId: 'user03', department: '디자인팀', totalConversations: 156, monthlyTokens: '67,200', status: 'active' as const },
  { name: '최수진', userId: 'user04', department: '마케팅팀', totalConversations: 12, monthlyTokens: '3,200', status: 'inactive' as const },
  { name: '정대호', userId: 'user05', department: '기획팀', totalConversations: 203, monthlyTokens: '87,600', status: 'active' as const },
  { name: '한지민', userId: 'user06', department: '인사팀', totalConversations: 89, monthlyTokens: '45,100', status: 'active' as const },
];

const PAGE_SIZE_OPTIONS = [6, 12, 24] as const;

export default function AdminUserManagement() {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  const filtered = query
    ? USERS.filter((u) => u.name.includes(query) || u.userId.includes(query))
    : USERS;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">사용자 관리</h1>
          <p className="text-sm text-text-secondary mt-1">총 {filtered.length}명의 사용자</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 h-11 rounded-lg border border-border bg-admin-input-bg">
        <Search className="w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          placeholder="사용자 이름 또는 ID 검색..."
          value={query}
          onChange={handleSearchChange}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedUsers.map((user) => (
          <UserCard key={user.userId} {...user} />
        ))}
      </div>

      <Pagination
        totalItems={filtered.length}
        pageSize={pageSize}
        initialPage={currentPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
        prevLabel="이전"
        nextLabel="다음"
      />
    </div>
  );
}

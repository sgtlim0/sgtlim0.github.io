'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Star } from 'lucide-react';
import type { LLMModel } from './types';
import ProviderBadge from './ProviderBadge';
import Pagination from '../Pagination';

export interface ModelTableProps {
  models: LLMModel[];
  initialProvider?: string;
  initialCategory?: string;
}

type SortKey = 'name' | 'provider' | 'inputPrice' | 'outputPrice' | 'contextWindow' | 'latency';
type SortDirection = 'asc' | 'desc';

export default function ModelTable({
  models,
  initialProvider = '전체',
  initialCategory = '전체',
}: ModelTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(initialProvider);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const providers = useMemo(() => {
    const uniqueProviders = Array.from(new Set(models.map(m => m.provider)));
    return ['전체', ...uniqueProviders.sort()];
  }, [models]);

  const categories = ['전체', 'chat', 'completion', 'embedding', 'image', 'audio', 'code'];

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          model.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvider = selectedProvider === '전체' || model.provider === selectedProvider;
      const matchesCategory = selectedCategory === '전체' || model.category === selectedCategory;
      return matchesSearch && matchesProvider && matchesCategory;
    });
  }, [models, searchTerm, selectedProvider, selectedCategory]);

  const sortedModels = useMemo(() => {
    return [...filteredModels].sort((a, b) => {
      let aVal: number | string = a[sortKey];
      let bVal: number | string = b[sortKey];

      if (sortKey === 'latency') {
        aVal = parseFloat(a.latency);
        bVal = parseFloat(b.latency);
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [filteredModels, sortKey, sortDirection]);

  const paginatedModels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedModels.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedModels, currentPage]);

  const totalPages = Math.ceil(sortedModels.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lr-text-muted" />
          <input
            type="text"
            placeholder="모델 또는 제공사 검색..."
            value={searchTerm}
            aria-label="모델 검색"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-lr-border rounded-lg bg-lr-bg text-lr-text-primary focus:outline-none focus:ring-2 focus:ring-lr-primary"
          />
        </div>
        <select
          value={selectedProvider}
          aria-label="제공사 필터"
          onChange={(e) => {
            setSelectedProvider(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-lr-border rounded-lg bg-lr-bg text-lr-text-primary focus:outline-none focus:ring-2 focus:ring-lr-primary"
        >
          {providers.map(provider => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
        <select
          value={selectedCategory}
          aria-label="카테고리 필터"
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-lr-border rounded-lg bg-lr-bg text-lr-text-primary focus:outline-none focus:ring-2 focus:ring-lr-primary"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-lr-border">
        <table className="w-full" aria-label="AI 모델 비교 테이블">
          <thead className="bg-lr-bg-section border-b border-lr-border">
            <tr>
              <th
                onClick={() => handleSort('name')}
                aria-sort={sortKey === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-4 py-3 text-left text-sm font-medium text-lr-text-primary cursor-pointer hover:bg-lr-bg-hover transition-colors"
              >
                모델명 <SortIcon columnKey="name" />
              </th>
              <th
                onClick={() => handleSort('provider')}
                aria-sort={sortKey === 'provider' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-4 py-3 text-left text-sm font-medium text-lr-text-primary cursor-pointer hover:bg-lr-bg-hover transition-colors"
              >
                제공사 <SortIcon columnKey="provider" />
              </th>
              <th
                onClick={() => handleSort('inputPrice')}
                aria-sort={sortKey === 'inputPrice' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-4 py-3 text-right text-sm font-medium text-lr-text-primary cursor-pointer hover:bg-lr-bg-hover transition-colors"
              >
                입력가격 <SortIcon columnKey="inputPrice" />
              </th>
              <th
                onClick={() => handleSort('outputPrice')}
                aria-sort={sortKey === 'outputPrice' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-4 py-3 text-right text-sm font-medium text-lr-text-primary cursor-pointer hover:bg-lr-bg-hover transition-colors"
              >
                출력가격 <SortIcon columnKey="outputPrice" />
              </th>
              <th
                onClick={() => handleSort('contextWindow')}
                aria-sort={sortKey === 'contextWindow' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-4 py-3 text-right text-sm font-medium text-lr-text-primary cursor-pointer hover:bg-lr-bg-hover transition-colors"
              >
                컨텍스트 <SortIcon columnKey="contextWindow" />
              </th>
              <th
                onClick={() => handleSort('latency')}
                aria-sort={sortKey === 'latency' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-4 py-3 text-right text-sm font-medium text-lr-text-primary cursor-pointer hover:bg-lr-bg-hover transition-colors"
              >
                레이턴시 <SortIcon columnKey="latency" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-lr-bg-table divide-y divide-lr-border">
            {paginatedModels.map(model => (
              <tr key={model.id} className="hover:bg-lr-bg-section transition-colors">
                <td className="px-4 py-3 text-sm text-lr-text-primary">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {model.isPopular && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <ProviderBadge provider={model.provider} size="sm" />
                </td>
                <td className="px-4 py-3 text-sm text-right text-lr-text-primary">
                  <span className={model.inputPrice < 500 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {formatPrice(model.inputPrice)}
                  </span>
                  <div className="text-xs text-lr-text-muted">/ 1M 토큰</div>
                </td>
                <td className="px-4 py-3 text-sm text-right text-lr-text-primary">
                  <span className={model.outputPrice < 2000 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {formatPrice(model.outputPrice)}
                  </span>
                  <div className="text-xs text-lr-text-muted">/ 1M 토큰</div>
                </td>
                <td className="px-4 py-3 text-sm text-right text-lr-text-secondary">
                  {model.contextWindow.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right text-lr-text-secondary">
                  {model.latency}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={sortedModels.length}
        pageSize={itemsPerPage}
        initialPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        showPageSizeSelector={false}
        prevLabel="이전"
        nextLabel="다음"
      />
    </div>
  );
}

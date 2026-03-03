'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';

export interface DocsSidebarItem {
  title: string;
  href: string;
  children?: DocsSidebarItem[];
}

export interface DocsSidebarProps {
  items: DocsSidebarItem[];
}

function SidebarItem({ item }: { item: DocsSidebarItem }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <div className="flex items-center">
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center w-full px-3 py-2 text-sm text-lr-text-primary hover:bg-lr-bg-section rounded-lg transition-colors"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            <span className="font-medium">{item.title}</span>
          </button>
        ) : (
          <Link
            href={item.href}
            className="flex items-center w-full px-3 py-2 text-sm text-lr-text-secondary hover:text-lr-text-primary hover:bg-lr-bg-section rounded-lg transition-colors"
          >
            {item.title}
          </Link>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {item.children?.map((child, index) => (
            <SidebarItem key={index} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocsSidebar({ items }: DocsSidebarProps) {
  return (
    <aside className="w-64 border-r border-lr-border bg-lr-bg p-4 space-y-2 overflow-y-auto">
      {items.map((item, index) => (
        <SidebarItem key={index} item={item} />
      ))}
    </aside>
  );
}

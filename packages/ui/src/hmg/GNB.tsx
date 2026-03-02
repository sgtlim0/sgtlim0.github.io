import React from 'react';

interface MenuItem {
  label: string;
  href: string;
}

interface GNBProps {
  brand: string;
  menuItems: MenuItem[];
  rightSlot?: React.ReactNode;
}

export default function GNB({ brand, menuItems, rightSlot }: GNBProps) {
  return (
    <nav className="w-full h-20 flex items-center justify-between px-20 bg-hmg-bg-card border-b border-hmg-border">
      <div className="text-[17px] font-bold text-hmg-navy">
        {brand}
      </div>

      <div className="flex items-center gap-10">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="text-[17px] font-medium text-[#333333] dark:text-hmg-text-body hover:text-hmg-navy transition-colors"
          >
            {item.label}
          </a>
        ))}
      </div>

      {rightSlot && (
        <div className="flex items-center gap-4">
          {rightSlot}
        </div>
      )}
    </nav>
  );
}

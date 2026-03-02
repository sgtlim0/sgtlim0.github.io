import React from 'react';

interface FooterProps {
  brands?: string[];
}

const DEFAULT_BRANDS = ['현대자동차', '기아', '제네시스', '현대모비스'];

export default function Footer({ brands = DEFAULT_BRANDS }: FooterProps) {
  return (
    <footer className="w-full bg-hmg-footer-bg px-20 py-12 flex flex-col gap-8">
      <div className="text-white text-[15px]">
        뉴스레터 구독
      </div>

      <div className="w-full h-px bg-[#333333]" />

      <div className="flex gap-6">
        {brands.map((brand, index) => (
          <span key={index} className="text-white text-[14px]">
            {brand}
          </span>
        ))}
      </div>

      <div className="text-[#999999] text-[13px]">
        © 2026 Hyundai Motor Group. All rights reserved.
      </div>
    </footer>
  );
}

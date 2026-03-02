import React from 'react';

interface HeroBannerProps {
  title: string;
  description: string;
}

export default function HeroBanner({ title, description }: HeroBannerProps) {
  return (
    <div className="w-full h-[300px] flex flex-col items-center justify-center bg-hmg-bg-section px-20 gap-5">
      <h1 className="text-[40px] font-bold text-center text-hmg-text-title">
        {title}
      </h1>
      <p className="text-[17px] font-normal text-center text-hmg-text-body">
        {description}
      </p>
    </div>
  );
}

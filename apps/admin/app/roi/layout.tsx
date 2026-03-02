import { ROISidebar, ROIDataProvider } from '@hchat/ui';

export default function ROILayout({ children }: { children: React.ReactNode }) {
  return (
    <ROIDataProvider>
      <div className="flex">
        <ROISidebar />
        <div className="flex-1 min-h-[calc(100vh-80px)] bg-[var(--roi-body-bg)] p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </div>
    </ROIDataProvider>
  );
}

'use client';

import { CreditCard, Download, AlertCircle } from 'lucide-react';

interface BillingRecord {
  month: string;
  description: string;
  amount: number;
  status: '결제 완료' | '결제 대기' | '결제 실패';
}

const billingHistory: BillingRecord[] = [
  {
    month: '2026.02',
    description: 'Pro Plan + 추가 사용',
    amount: 142500,
    status: '결제 완료'
  },
  {
    month: '2026.01',
    description: 'Pro Plan',
    amount: 99000,
    status: '결제 완료'
  },
  {
    month: '2025.12',
    description: 'Pro Plan',
    amount: 99000,
    status: '결제 완료'
  }
];

export default function BillingPage() {
  const handleChangePaymentMethod = () => {
    alert('결제 수단 변경 기능은 준비중입니다.');
  };

  const handleDownloadInvoice = (month: string) => {
    alert(`${month} 인보이스 PDF 다운로드 준비중`);
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold text-[var(--lr-text-primary)] mb-8">결제 관리</h1>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-gradient-to-br from-[var(--lr-primary)] to-[var(--lr-accent)] rounded-lg p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pro Plan</h2>
              <p className="text-white/90">
                사용량 기준 추가 요금이 부과됩니다
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">₩99,000</div>
              <div className="text-white/90 text-sm">/월</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            <div>
              <div className="text-white/80 text-sm mb-1">월 기본 요청</div>
              <div className="text-xl font-semibold">50,000건</div>
            </div>
            <div>
              <div className="text-white/80 text-sm mb-1">월 기본 토큰</div>
              <div className="text-xl font-semibold">5M</div>
            </div>
            <div>
              <div className="text-white/80 text-sm mb-1">추가 비용</div>
              <div className="text-xl font-semibold">₩0.01/토큰</div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--lr-text-primary)]">결제 수단</h2>
            <button
              onClick={handleChangePaymentMethod}
              className="px-4 py-2 text-sm bg-[var(--lr-bg)] border border-[var(--lr-border)] text-[var(--lr-text-primary)] rounded-lg hover:bg-[var(--lr-border)] transition-colors"
            >
              결제 수단 변경
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-[var(--lr-bg)] border border-[var(--lr-border)] rounded-lg">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-[var(--lr-text-primary)]">Visa **** 4242</div>
              <div className="text-sm text-[var(--lr-text-secondary)]">만료 12/27</div>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
              기본 결제 수단
            </div>
          </div>
        </div>

        {/* Current Month Usage */}
        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-[var(--lr-text-primary)]">이번 달 사용량</h2>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-[var(--lr-border)]">
              <span className="text-[var(--lr-text-secondary)]">기본 요금 (Pro Plan)</span>
              <span className="font-semibold text-[var(--lr-text-primary)]">₩99,000</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[var(--lr-border)]">
              <div>
                <div className="text-[var(--lr-text-secondary)]">추가 토큰 사용</div>
                <div className="text-sm text-[var(--lr-text-muted)]">435,000 토큰</div>
              </div>
              <span className="font-semibold text-orange-500">₩43,500</span>
            </div>
            <div className="flex items-center justify-between py-3 pt-4">
              <span className="text-lg font-semibold text-[var(--lr-text-primary)]">예상 청구 금액</span>
              <span className="text-2xl font-bold text-[var(--lr-text-primary)]">₩142,500</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  기본 요금을 초과했습니다
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  이번 달 사용량이 기본 포함량을 초과하여 추가 요금이 발생합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[var(--lr-text-primary)] mb-4">결제 내역</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--lr-border)]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                    기간
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                    설명
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                    금액
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                    상태
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                    인보이스
                  </th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((record) => (
                  <tr key={record.month} className="border-b border-[var(--lr-border)] last:border-0">
                    <td className="py-4 px-4">
                      <span className="font-medium text-[var(--lr-text-primary)]">{record.month}</span>
                    </td>
                    <td className="py-4 px-4 text-[var(--lr-text-secondary)]">
                      {record.description}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-[var(--lr-text-primary)]">
                      ₩{record.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          record.status === '결제 완료'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : record.status === '결제 대기'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(record.month)}
                        className="inline-flex items-center gap-2 text-sm text-[var(--lr-primary)] hover:text-[var(--lr-primary-hover)] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        다운로드
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'

import { useState, useEffect } from 'react'
import type { TrainingDataset, FineTuneJob } from './services/finetunTypes'
import { getDatasets, getFineTuneJobs, getEvaluation } from './services/finetunService'

export default function FineTuneDashboard() {
  const [datasets, setDatasets] = useState<TrainingDataset[]>([])
  const [jobs, setJobs] = useState<FineTuneJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDatasets(), getFineTuneJobs()]).then(([d, j]) => {
      setDatasets(d)
      setJobs(j)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8 text-center text-text-secondary">파인튜닝 로딩 중...</div>

  const STATUS_COLORS: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    running: 'bg-yellow-100 text-yellow-700',
    queued: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  }
  const DS_STATUS: Record<string, string> = {
    ready: 'bg-green-100 text-green-700',
    validating: 'bg-yellow-100 text-yellow-700',
    uploaded: 'bg-blue-100 text-blue-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">AI 모델 파인튜닝</h2>
        <p className="text-sm text-text-secondary mt-1">
          {datasets.length}개 데이터셋 | {jobs.length}개 학습 작업
        </p>
      </div>

      {/* Jobs */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">학습 작업</h3>
        {jobs.map((job) => (
          <div key={job.id} className="p-4 rounded-xl border border-border bg-admin-bg-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-text-primary">{job.name}</span>
                <span className="text-xs text-text-tertiary ml-2">({job.baseModel})</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status]}`}
              >
                {job.status}
              </span>
            </div>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 bg-bg-hover rounded-full">
                <div
                  className="h-full bg-admin-teal rounded-full transition-all"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary w-12 text-right">{job.progress}%</span>
            </div>
            {/* Loss Chart (text representation) */}
            {job.trainingLoss.length > 0 && (
              <div className="flex gap-4 text-xs text-text-secondary">
                <span>
                  에포크: {job.currentEpoch}/{job.epochs}
                </span>
                <span>Train Loss: {job.trainingLoss[job.trainingLoss.length - 1]}</span>
                <span>Val Loss: {job.validationLoss[job.validationLoss.length - 1]}</span>
                <span>예상 비용: ₩{job.estimatedCost.toLocaleString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Datasets */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">학습 데이터셋</h3>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-admin-bg-section border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                  이름
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                  형식
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                  행 수
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                  크기
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((ds) => (
                <tr key={ds.id} className="border-b border-border-light hover:bg-admin-table-hover">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-primary">{ds.name}</div>
                    <div className="text-xs text-text-tertiary">{ds.description}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary uppercase text-xs">{ds.format}</td>
                  <td className="px-4 py-3 text-text-primary tabular-nums">
                    {ds.rowCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {(ds.size / 1000000).toFixed(1)}MB
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${DS_STATUS[ds.status]}`}
                    >
                      {ds.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

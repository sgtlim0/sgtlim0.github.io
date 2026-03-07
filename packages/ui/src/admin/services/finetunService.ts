/**
 * Fine-tuning Service
 */
import type {
  TrainingDataset,
  FineTuneJob,
  FineTuneEvaluation,
  HyperParameters,
} from './finetunTypes'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_DATASETS: TrainingDataset[] = [
  {
    id: 'ds-1',
    name: '번역 학습 데이터',
    description: '한영 병렬 코퍼스 (기술 문서)',
    format: 'jsonl',
    size: 15000000,
    rowCount: 25000,
    validationSplit: 0.1,
    status: 'ready',
    createdAt: '2026-02-15',
  },
  {
    id: 'ds-2',
    name: '고객 응대 데이터',
    description: '고객 문의 및 응답 쌍',
    format: 'jsonl',
    size: 8500000,
    rowCount: 12000,
    validationSplit: 0.15,
    status: 'ready',
    createdAt: '2026-02-20',
  },
  {
    id: 'ds-3',
    name: '코드 리뷰 데이터',
    description: 'PR 리뷰 코멘트 데이터셋',
    format: 'csv',
    size: 5200000,
    rowCount: 8000,
    validationSplit: 0.1,
    status: 'validating',
    createdAt: '2026-03-05',
  },
]

const MOCK_JOBS: FineTuneJob[] = [
  {
    id: 'ft-1',
    name: '번역 모델 v1',
    baseModel: 'GPT-4o-mini',
    datasetId: 'ds-1',
    hyperparameters: {
      learningRate: 0.0001,
      batchSize: 16,
      epochs: 3,
      warmupSteps: 100,
      weightDecay: 0.01,
    },
    status: 'completed',
    progress: 100,
    epochs: 3,
    currentEpoch: 3,
    trainingLoss: [0.8, 0.5, 0.3],
    validationLoss: [0.85, 0.55, 0.35],
    startedAt: '2026-02-20T10:00:00Z',
    completedAt: '2026-02-20T14:30:00Z',
    resultModelId: 'ft-gpt4o-translate-v1',
    estimatedCost: 150000,
  },
  {
    id: 'ft-2',
    name: '고객 응대 모델',
    baseModel: 'Claude 3.5 Haiku',
    datasetId: 'ds-2',
    hyperparameters: {
      learningRate: 0.00005,
      batchSize: 8,
      epochs: 5,
      warmupSteps: 200,
      weightDecay: 0.01,
    },
    status: 'running',
    progress: 60,
    epochs: 5,
    currentEpoch: 3,
    trainingLoss: [0.9, 0.6, 0.45],
    validationLoss: [0.95, 0.65, 0.5],
    startedAt: '2026-03-07T08:00:00Z',
    estimatedCost: 220000,
  },
]

export async function getDatasets(): Promise<TrainingDataset[]> {
  await delay(200)
  return MOCK_DATASETS
}

export async function getDatasetById(id: string): Promise<TrainingDataset | null> {
  await delay(100)
  return MOCK_DATASETS.find((d) => d.id === id) ?? null
}

export async function uploadDataset(
  file: { name: string; size: number },
  description: string,
): Promise<TrainingDataset> {
  await delay(500)
  const ext = file.name.split('.').pop() || 'jsonl'
  return {
    id: `ds-${Date.now()}`,
    name: file.name,
    description,
    format: ext as TrainingDataset['format'],
    size: file.size,
    rowCount: 0,
    validationSplit: 0.1,
    status: 'uploaded',
    createdAt: new Date().toISOString(),
  }
}

export async function deleteDataset(id: string): Promise<boolean> {
  await delay(200)
  return MOCK_DATASETS.some((d) => d.id === id)
}

export async function getFineTuneJobs(): Promise<FineTuneJob[]> {
  await delay(200)
  return MOCK_JOBS
}

export async function getFineTuneJobById(id: string): Promise<FineTuneJob | null> {
  await delay(100)
  return MOCK_JOBS.find((j) => j.id === id) ?? null
}

export async function startFineTuneJob(
  name: string,
  baseModel: string,
  datasetId: string,
  params: HyperParameters,
): Promise<FineTuneJob> {
  await delay(400)
  return {
    id: `ft-${Date.now()}`,
    name,
    baseModel,
    datasetId,
    hyperparameters: params,
    status: 'queued',
    progress: 0,
    epochs: params.epochs,
    currentEpoch: 0,
    trainingLoss: [],
    validationLoss: [],
    startedAt: new Date().toISOString(),
    estimatedCost: Math.floor(Math.random() * 300000) + 50000,
  }
}

export async function cancelFineTuneJob(id: string): Promise<boolean> {
  await delay(200)
  return MOCK_JOBS.some((j) => j.id === id && j.status === 'running')
}

export async function getEvaluation(jobId: string): Promise<FineTuneEvaluation | null> {
  await delay(300)
  const job = MOCK_JOBS.find((j) => j.id === jobId && j.status === 'completed')
  if (!job) return null
  return {
    jobId,
    baseModelScore: 78,
    fineTunedModelScore: 91,
    improvement: 16.7,
    metrics: [
      { name: '정확도', base: 78, finetuned: 91 },
      { name: '유창성', base: 82, finetuned: 89 },
      { name: '전문 용어', base: 65, finetuned: 94 },
    ],
    sampleOutputs: [
      {
        prompt: '현대차 하이브리드 시스템을 설명하세요',
        baseResponse: 'Hyundai hybrid system...',
        fineTunedResponse: '현대자동차의 하이브리드 시스템은 병렬형 방식으로...',
      },
    ],
  }
}

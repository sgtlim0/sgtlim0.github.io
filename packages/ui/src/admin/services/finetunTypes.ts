/**
 * AI Model Fine-tuning types
 */

export interface TrainingDataset {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly format: 'jsonl' | 'csv' | 'parquet'
  readonly size: number
  readonly rowCount: number
  readonly validationSplit: number
  readonly status: 'uploaded' | 'validating' | 'ready' | 'error'
  readonly createdAt: string
  readonly errors?: string[]
}

export interface FineTuneJob {
  readonly id: string
  readonly name: string
  readonly baseModel: string
  readonly datasetId: string
  readonly hyperparameters: HyperParameters
  readonly status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  readonly progress: number
  readonly epochs: number
  readonly currentEpoch: number
  readonly trainingLoss: number[]
  readonly validationLoss: number[]
  readonly startedAt: string
  readonly completedAt?: string
  readonly resultModelId?: string
  readonly estimatedCost: number
}

export interface HyperParameters {
  readonly learningRate: number
  readonly batchSize: number
  readonly epochs: number
  readonly warmupSteps: number
  readonly weightDecay: number
}

export interface FineTuneEvaluation {
  readonly jobId: string
  readonly baseModelScore: number
  readonly fineTunedModelScore: number
  readonly improvement: number
  readonly metrics: { name: string; base: number; finetuned: number }[]
  readonly sampleOutputs: { prompt: string; baseResponse: string; fineTunedResponse: string }[]
}

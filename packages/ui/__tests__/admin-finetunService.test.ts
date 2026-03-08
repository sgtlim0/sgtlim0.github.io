import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDatasets,
  getDatasetById,
  uploadDataset,
  deleteDataset,
  getFineTuneJobs,
  getFineTuneJobById,
  startFineTuneJob,
  cancelFineTuneJob,
  getEvaluation,
} from '../src/admin/services/finetunService'

describe('finetunService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getDatasets', () => {
    it('should return training datasets', async () => {
      const promise = getDatasets()
      vi.advanceTimersByTime(300)
      const datasets = await promise

      expect(datasets.length).toBeGreaterThan(0)
      datasets.forEach((d) => {
        expect(d).toHaveProperty('id')
        expect(d).toHaveProperty('name')
        expect(d).toHaveProperty('format')
        expect(d).toHaveProperty('size')
        expect(d).toHaveProperty('rowCount')
        expect(d).toHaveProperty('status')
      })
    })

    it('should include different statuses', async () => {
      const promise = getDatasets()
      vi.advanceTimersByTime(300)
      const datasets = await promise

      const statuses = datasets.map((d) => d.status)
      expect(statuses).toContain('ready')
      expect(statuses).toContain('validating')
    })
  })

  describe('getDatasetById', () => {
    it('should return dataset for valid ID', async () => {
      const promise = getDatasetById('ds-1')
      vi.advanceTimersByTime(200)
      const dataset = await promise

      expect(dataset).not.toBeNull()
      expect(dataset?.id).toBe('ds-1')
      expect(dataset?.name).toBe('번역 학습 데이터')
    })

    it('should return null for invalid ID', async () => {
      const promise = getDatasetById('non-existent')
      vi.advanceTimersByTime(200)
      const dataset = await promise

      expect(dataset).toBeNull()
    })
  })

  describe('uploadDataset', () => {
    it('should create a new dataset from file', async () => {
      const promise = uploadDataset({ name: 'test.jsonl', size: 5000000 }, '테스트 데이터')
      vi.advanceTimersByTime(600)
      const dataset = await promise

      expect(dataset.id).toBeTruthy()
      expect(dataset.name).toBe('test.jsonl')
      expect(dataset.description).toBe('테스트 데이터')
      expect(dataset.format).toBe('jsonl')
      expect(dataset.size).toBe(5000000)
      expect(dataset.status).toBe('uploaded')
      expect(dataset.rowCount).toBe(0)
    })

    it('should detect format from file extension', async () => {
      const promise = uploadDataset({ name: 'data.csv', size: 1000 }, 'CSV 데이터')
      vi.advanceTimersByTime(600)
      const dataset = await promise

      expect(dataset.format).toBe('csv')
    })
  })

  describe('deleteDataset', () => {
    it('should return true for existing dataset', async () => {
      const promise = deleteDataset('ds-1')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(true)
    })

    it('should return false for non-existent dataset', async () => {
      const promise = deleteDataset('non-existent')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(false)
    })
  })

  describe('getFineTuneJobs', () => {
    it('should return fine-tune jobs', async () => {
      const promise = getFineTuneJobs()
      vi.advanceTimersByTime(300)
      const jobs = await promise

      expect(jobs.length).toBeGreaterThan(0)
      jobs.forEach((j) => {
        expect(j).toHaveProperty('id')
        expect(j).toHaveProperty('name')
        expect(j).toHaveProperty('baseModel')
        expect(j).toHaveProperty('status')
        expect(j).toHaveProperty('progress')
        expect(j).toHaveProperty('epochs')
        expect(j).toHaveProperty('trainingLoss')
        expect(j).toHaveProperty('validationLoss')
      })
    })

    it('should include jobs with different statuses', async () => {
      const promise = getFineTuneJobs()
      vi.advanceTimersByTime(300)
      const jobs = await promise

      const statuses = jobs.map((j) => j.status)
      expect(statuses).toContain('completed')
      expect(statuses).toContain('running')
    })
  })

  describe('getFineTuneJobById', () => {
    it('should return job for valid ID', async () => {
      const promise = getFineTuneJobById('ft-1')
      vi.advanceTimersByTime(200)
      const job = await promise

      expect(job).not.toBeNull()
      expect(job?.id).toBe('ft-1')
      expect(job?.status).toBe('completed')
    })

    it('should return null for invalid ID', async () => {
      const promise = getFineTuneJobById('non-existent')
      vi.advanceTimersByTime(200)
      const job = await promise

      expect(job).toBeNull()
    })
  })

  describe('startFineTuneJob', () => {
    it('should create a new fine-tune job', async () => {
      const params = {
        learningRate: 0.0001,
        batchSize: 8,
        epochs: 3,
        warmupSteps: 100,
        weightDecay: 0.01,
      }
      const promise = startFineTuneJob('테스트 모델', 'GPT-4o-mini', 'ds-1', params)
      vi.advanceTimersByTime(500)
      const job = await promise

      expect(job.id).toBeTruthy()
      expect(job.name).toBe('테스트 모델')
      expect(job.baseModel).toBe('GPT-4o-mini')
      expect(job.status).toBe('queued')
      expect(job.progress).toBe(0)
      expect(job.epochs).toBe(3)
      expect(job.currentEpoch).toBe(0)
      expect(job.trainingLoss).toEqual([])
      expect(job.estimatedCost).toBeGreaterThan(0)
    })
  })

  describe('cancelFineTuneJob', () => {
    it('should return true for running job', async () => {
      const promise = cancelFineTuneJob('ft-2')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(true)
    })

    it('should return false for completed job', async () => {
      const promise = cancelFineTuneJob('ft-1')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(false)
    })

    it('should return false for non-existent job', async () => {
      const promise = cancelFineTuneJob('non-existent')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(false)
    })
  })

  describe('getEvaluation', () => {
    it('should return evaluation for completed job', async () => {
      const promise = getEvaluation('ft-1')
      vi.advanceTimersByTime(400)
      const evaluation = await promise

      expect(evaluation).not.toBeNull()
      expect(evaluation?.jobId).toBe('ft-1')
      expect(evaluation?.baseModelScore).toBeGreaterThan(0)
      expect(evaluation?.fineTunedModelScore).toBeGreaterThan(0)
      expect(evaluation?.improvement).toBeGreaterThan(0)
      expect(evaluation?.metrics).toBeInstanceOf(Array)
      expect(evaluation?.sampleOutputs).toBeInstanceOf(Array)
    })

    it('should return null for running job', async () => {
      const promise = getEvaluation('ft-2')
      vi.advanceTimersByTime(400)
      const evaluation = await promise

      expect(evaluation).toBeNull()
    })

    it('should return null for non-existent job', async () => {
      const promise = getEvaluation('non-existent')
      vi.advanceTimersByTime(400)
      const evaluation = await promise

      expect(evaluation).toBeNull()
    })
  })
})

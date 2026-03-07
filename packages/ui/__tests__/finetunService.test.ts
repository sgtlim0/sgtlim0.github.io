import { describe, it, expect } from 'vitest'
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
  it('should return datasets', async () => {
    const ds = await getDatasets()
    expect(ds.length).toBe(3)
    expect(ds[0].status).toBe('ready')
  })

  it('should get dataset by id', async () => {
    const ds = await getDatasetById('ds-1')
    expect(ds).not.toBeNull()
    expect(ds!.name).toContain('번역')
  })

  it('should upload dataset', async () => {
    const ds = await uploadDataset({ name: 'test.jsonl', size: 1000 }, 'Test data')
    expect(ds.status).toBe('uploaded')
    expect(ds.description).toBe('Test data')
  })

  it('should delete dataset', async () => {
    expect(await deleteDataset('ds-1')).toBe(true)
    expect(await deleteDataset('nonexistent')).toBe(false)
  })

  it('should return fine-tune jobs', async () => {
    const jobs = await getFineTuneJobs()
    expect(jobs.length).toBe(2)
    expect(jobs[0].status).toBe('completed')
    expect(jobs[1].status).toBe('running')
  })

  it('should get job by id', async () => {
    const job = await getFineTuneJobById('ft-1')
    expect(job).not.toBeNull()
    expect(job!.trainingLoss.length).toBe(3)
  })

  it('should start a job', async () => {
    const job = await startFineTuneJob('Test', 'GPT-4o', 'ds-1', {
      learningRate: 0.0001,
      batchSize: 16,
      epochs: 3,
      warmupSteps: 100,
      weightDecay: 0.01,
    })
    expect(job.status).toBe('queued')
    expect(job.progress).toBe(0)
  })

  it('should cancel running job', async () => {
    expect(await cancelFineTuneJob('ft-2')).toBe(true)
    expect(await cancelFineTuneJob('ft-1')).toBe(false) // completed
  })

  it('should get evaluation for completed job', async () => {
    const ev = await getEvaluation('ft-1')
    expect(ev).not.toBeNull()
    expect(ev!.improvement).toBeGreaterThan(0)
    expect(ev!.fineTunedModelScore).toBeGreaterThan(ev!.baseModelScore)
    expect(ev!.metrics.length).toBeGreaterThan(0)
  })

  it('should return null evaluation for running job', async () => {
    const ev = await getEvaluation('ft-2')
    expect(ev).toBeNull()
  })
})

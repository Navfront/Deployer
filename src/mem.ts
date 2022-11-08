export interface Job {
  'commit': string | null
  'kill': string[]
  'delete': string[]
  'use': string[]
}

export type SubscribeCallBack = (() => void) | null

export class Mem {
  private readonly jobQueue: Job[] = []
  private cb: SubscribeCallBack

  constructor () {
    this.cb = null
  }

  subscribePushes (cb: SubscribeCallBack): void {
    this.cb = cb
  }

  pushJob (job: Job): void {
    console.log('Pushing job..', job)
    this.jobs.push(job)
    if (this.cb != null) {
      this.cb()
    }
  }

  shiftJob (): Job | null {
    if (this.jobQueue.length > 0) {
      return this.jobQueue.shift() as Job
    }
    return null
  }

  get length (): number {
    return this.jobs.length
  }

  get jobs (): Job[] {
    return this.jobQueue
  }

  clearJobs (): void {
    console.log('Clear all jobs..')
    this.jobQueue.length = 0
  }
}

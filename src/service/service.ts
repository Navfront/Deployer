
import { Mem } from '../mem.js'
import { ex } from './executer.js'
import { EmitAll } from '../deployer.js'
import { dockerRun, getDockerVersion, getNameFromImage, parseContainers, parseImages, rmDockerContainer, rmDockerImage, stopDockerContainer } from './utils.js'
import { DCompose } from './dcompose.js'
import { Container, GetContainers, GetImages, Image } from '../types/service-types.js'
import { MsgTypes } from '../types/deployer-types.js'

export class Service {
  private containers: Container[] = []
  private images: Image[] = []
  private readonly mem: Mem
  private readonly dComposeService: DCompose
  emitAll: EmitAll

  constructor (mem: Mem, emitAll: EmitAll) {
    this.dComposeService = new DCompose()
    this.mem = mem
    this.mem.subscribePushes(this.work.bind(this))
    this.emitAll = emitAll
  }

  private async getContainers (): Promise<GetContainers> {
    const raw = await ex('docker ps -a')
    if (/error during connect/gi.test(raw)) {
      return {
        error: 'Error durning connect!',
        raw: '',
        containers: []
      }
    }
    this.containers = parseContainers(raw)
    return {
      error: null,
      raw,
      containers: this.containers
    }
  }

  private async getImages (): Promise<GetImages> {
    const raw = await ex('docker image ls')
    if (/error during connect/gi.test(raw)) {
      return {
        error: 'Error durning connect!',
        raw: '',
        images: []
      }
    }
    this.images = parseImages(raw)
    return {
      error: null,
      raw,
      images: this.images
    }
  }

  private async work (): Promise<void> {
    let job = this.mem.shiftJob()
    if (job === null) {
      console.log('Nothing to do..')
    }
    while (job != null) {
      const version = await getDockerVersion()
      if (version.error != null) {
        await this.emitAll(MsgTypes.message, version.error)
      } else await this.emitAll(MsgTypes.message, version.message)

      console.log('doing job', job, 'left: ', this.mem.length)
      // get current containers
      const current = await this.getContainers()

      if (current.error != null) {
        await this.emitAll(MsgTypes.message, current.error)
      }

      console.log('curr', current.containers)
      // DOCKER STOP CONTAINERS FROM JOB
      for (const container of job.runs.services) {
        const searchTemplate = container.name.replace(/:v\d\.\d\.\d/, '')
        const condidate = this.containers.find(c => new RegExp(searchTemplate).test(c.image))
        if (condidate != null) {
          if (condidate.isOnline) {
            const stopped = await stopDockerContainer(condidate.id)
            if (stopped.message != null) (await this.emitAll(MsgTypes.message, stopped.message))
            else {
              await this.emitAll(MsgTypes.message, stopped.error)
            }
          }

          // DOCKER DELETE CONTAINERS FROM JOB
          const removed = await rmDockerContainer(condidate.id)
          if (removed.message != null) {
            await this.emitAll(MsgTypes.message, removed.message)
          } else await this.emitAll(MsgTypes.message, removed.error)
        }
      }

      // DELETING OLD IMAGES
      const imagesData = await this.getImages()
      if (imagesData.error != null) {
        await this.emitAll(MsgTypes.message, imagesData.error)
      } else {
        const images = imagesData.images

        for (const service of job.runs.services) {
          const serviceName = getNameFromImage(service.image)
          console.log(images, job?.runs.services)
          const condidates = images.filter(image => image.name === serviceName && JSON.stringify(image.version) !== JSON.stringify(service.version))
          console.log('DELETE IMAGES CONDIDATES:', condidates)
          for (const delCondidate of condidates) {
            const result = await rmDockerImage(delCondidate.id)
            await this.emitAll(MsgTypes.message, result.message ?? result.error)
          }
        }
      }

      // DOCKER RUN..
      if (Object.hasOwn(job.runs, 'version')) {
        this.dComposeService.writeDCSchemaToYML(job.runs)
        void dockerRun('docker-compose up', async (data) => {
          await this.emitAll(MsgTypes.message, data)
          await this.emitAll(MsgTypes.message, 'Job completed!')
        },
        async (error) => {
          await this.emitAll(MsgTypes.message, error)
        })
      }
      job = this.mem.shiftJob()
    }
  }
}

import OSS from 'ali-oss'

import { getOssUploadConfig } from '@/api/uploadConfig'
import { aesDecryptCryptoJS } from '../common'

interface IOssOptions {
  partSize?: number
  parallel?: number
  progress?: (percentage: number, speedMB: number) => void
  success?: (name: string) => void
  fail?: (error: Error) => void
  checkpoint?: OSS.Checkpoint // 支持传入检查点（用于续传）
}

export class OssUploader {
  private client: OSS | null = null
  private currentFileName = ''
  private checkpoints = new Map<string, OSS.Checkpoint>()
  private parallel = import.meta.env.VITE_MAX_CONCURRENT_CHUNK || 20
  private lastTime = 0 // 上次记录时间戳(毫秒)
  private lastLoaded = 0 // 上次已上传字节数
  private currentOptions: IOssOptions = {}
  private taskId = ''
  private apiCount = 0
  private uploadPath = '' // 新增：路径前缀，不含末尾斜杠
  private ossInf = ''

  constructor(fileName: string, taskId: string, ossInf: string, uploadPath?: string) {
    // this.uploadPath = (uploadPath || '').replace(/\/+$/g, '') // 去掉末尾斜杠
    // // 规范拼接得到最终对象名（key）
    // this.currentFileName = this.buildObjectKey(fileName)
    this.currentFileName = (fileName || '').replace(/\/+$/g, '')
    this.taskId = taskId
    this.ossInf = ossInf
  }

  // 新增：生成 object key 的 helper，确保 path 与 name 拼接正确
  private buildObjectKey(fileName: string) {
    // 若 fileName 已包含路径则直接返回，否则拼接 uploadPath
    if (!this.uploadPath) return fileName
    return `${this.uploadPath}/${fileName.replace(/^\/+/, '')}`
  }

  private async initializeClient() {
    if (this.client) return
    this.decodeToken(this.ossInf)
  }
  private async decodeToken(authInfo: string) {
    const plain = await aesDecryptCryptoJS(authInfo, this.taskId)

    const res = JSON.parse(plain)
    console.log(res)
    this.client = new OSS({
      region: 'oss-cn-shanghai',
      accessKeyId: res.AccessKeyId,
      accessKeySecret: res.AccessKeySecret,
      bucket: 'huishou01',
      stsToken: res.SecurityToken
    })
  }

  // 若需要外部在实例化后修改路径，可提供 setter
  setUploadPath(path: string) {
    this.uploadPath = (path || '').replace(/\/+$/g, '')
    // 重新计算 currentFileName 保证一致性（保留原文件名部分）
    const baseName = this.currentFileName.split('/').pop() || this.currentFileName
    this.currentFileName = this.buildObjectKey(baseName)
  }

  /** 简单上传 */
  async put(file: File): Promise<string> {
    await this.initializeClient()
    if (!this.client) throw new Error('OSS client not initialized')
    try {
      const result = await this.client!.put(this.currentFileName, file)
      if (result.res.status === 200) {
        return result.name
      } else {
        throw new Error('上传失败')
      }
    } catch (error) {
      ElMessage.error('上传失败')
      throw error
    }
  }

  /** 分片上传（含暂停/继续功能） */
  async multipartUpload(file: File, options: IOssOptions = {}): Promise<void> {
    this.currentOptions = options
    this.parallel = options.parallel || this.parallel

    await this.initializeClient()

    const startTime = Date.now()
    try {
      const result = await this.client!.multipartUpload(this.currentFileName, file, {
        partSize: options.partSize || 5 * 1024 * 1024,
        parallel: this.parallel,
        progress: (p, checkpoint) => this.handleProgress(p, checkpoint, file, startTime),
        checkpoint: options.checkpoint
      })

      // // 上传成功后移除检查点
      // this.checkpoints.delete(this.currentFileName)
      options.success?.(result.name)

      // 尝试从检查点合并切片（兼容手动分片或 SDK 未自动合并的情况）
      try {
        await this.finalizeUploadFromCheckpoint(this.currentFileName)
      } catch (err) {
        // 合并失败不影响 SDK 的成功回调，但回调失败信息可通知上层
        // eslint-disable-next-line no-console
        console.warn('finalizeUploadFromCheckpoint failed:', err)
      }
    } catch (error: any) {
      if (error.name === 'cancel') {
      } else if (error.name === 'ConnectionTimeoutError') {
        return this.multipartUpload(file, this.currentOptions)
      } else {
        options.fail?.(error)
        throw error
      }
    }
  }

  /**
   * 完成分片合并：调用 OSS 的 completeMultipartUpload 接口
   */
  async completeMultipartUpload(
    name: string,
    uploadId: string,
    parts: Array<{ number: number; etag: string }>,
    options?: any
  ): Promise<void> {
    // await this.initializeClient()
    if (!this.client) throw new Error('OSS client not initialized')

    try {
      const clientAny = this.client as any
      let result: any

      if (typeof clientAny.completeMultipartUpload === 'function') {
        result = await clientAny.completeMultipartUpload(name, uploadId, parts, options)
      } else if (typeof clientAny.multipartUploadComplete === 'function') {
        result = await clientAny.multipartUploadComplete(name, uploadId, parts, options)
      } else {
        // 有些场景 SDK 已经自动合并，直接返回成功
        return
      }

      // 清理检查点与当前文件状态
      this.checkpoints.delete(name)
      if (this.currentFileName === name) {
        this.currentFileName = ''
      }

      this.currentOptions.success?.(result?.name ?? name)
      return
    } catch (error: any) {
      this.currentOptions.fail?.(error)
      throw error
    }
  }

  /**
   * 从已保存的 checkpoint 中提取 parts 并调用 completeMultipartUpload
   * 兼容不同 checkpoint 字段名
   */
  private async finalizeUploadFromCheckpoint(name: string): Promise<void> {
    const checkpoint = this.checkpoints.get(name) as any
    if (!checkpoint) return

    const uploadId =
      checkpoint.uploadId ||
      checkpoint.UploadId ||
      (checkpoint.multipart && checkpoint.multipart.uploadId)
    if (!uploadId) return

    // 尝试提取已上传分片信息，兼容多种字段命名
    const candidates =
      checkpoint.parts ||
      checkpoint.partMeta ||
      checkpoint.uploadedParts ||
      checkpoint.multipart?.parts ||
      checkpoint.multipart?.partMeta ||
      []

    if (!Array.isArray(candidates) || candidates.length === 0) return

    const parts = candidates
      .map((p: any) => {
        const number = p.partNumber || p.part || p.number
        const etag = p.eTag || p.etag || p.ETag || p.tag
        if (number == null || !etag) return null
        return { number: Number(number), etag }
      })
      .filter(Boolean) as Array<{ number: number; etag: string }>

    if (parts.length === 0) return

    await this.completeMultipartUpload(name, uploadId, parts)
  }

  private handleProgress(p: number, checkpoint: OSS.Checkpoint, file: File, startTime: number) {
    // 实时速率计算
    const currentTime = Date.now()

    // 平均速度计算
    const totalSpeedMB = (p * file.size) / (1024 * 1024) / ((currentTime - startTime) / 1000)

    // 更新状态
    this.currentOptions.progress?.(Math.round(p * 100), Number(totalSpeedMB.toFixed(2)))

    // 保存检查点（用于断点续传）
    this.checkpoints.set(this.currentFileName, checkpoint)
    this.lastLoaded = p * file.size
    this.lastTime = currentTime
  }

  /** 暂停上传 */
  pauseUpload(): boolean {
    if (!this.checkpoints.has(this.currentFileName)) {
      return false
    }
    ;(this.client as any)?.cancel()
    return true
  }

  /** 继续上传 */
  async resumeUpload(file: File): Promise<void> {
    const checkpoint = this.checkpoints.get(this.currentFileName)
    return this.multipartUpload(file, {
      ...this.currentOptions,
      checkpoint,
      partSize: checkpoint?.partSize,
      parallel: this.parallel
    })
  }

  /** 中止上传 */
  async abortUpload(): Promise<boolean> {
    const checkpoint = this.checkpoints.get(this.currentFileName)
    if (!checkpoint || !this.client) return false

    try {
      await this.client.abortMultipartUpload(checkpoint.name, checkpoint.uploadId)
      this.client = null
      return true
    } catch {
      return false
    }
  }

  /** 删除文件 */
  async delete(): Promise<boolean> {
    if (!this.client) return false
    try {
      await this.client!.delete(this.currentFileName)
      return true
    } catch {
      return false
    }
  }
}

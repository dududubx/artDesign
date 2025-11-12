import { OssUploader } from '@/utils/oss'
export interface FileCategory {
  id?: number | string
  name: string
  parent_id?: string
  sort?: number
  remark?: string
  create_time?: string
  children?: FileCategory[]
}

export interface chunkObj {
  blob: Blob
  index: number
  size: number
}

export interface FileList {
  id?: string | number
  name: string
  progress: number
  currentStatus: string
  size: number
  raw: File
  chunks: chunkObj[]
  successNum?: number
  successIndexArr?: number[]
  oss?: any
  limiteChunk?: number
  fileUploadType?: string
  fileHash?: string
  uploadPath?: string
  uploadMode?: string
  apiData?: any
}

export interface FileCategory {
  id?: number | string
  name: string
  parent_id?: string
  sort: number
  remark: string
  create_time?: string
  children?: FileCategory[]
}

export interface FileList {
  name: string
  progress: number
  currentStatus: string
  size: number
  raw: File
  chunks: Blob[]
}

import request from '@/utils/http'
import { CancelToken } from 'axios'

// 上传文件
export function fetchUploadFiles(params: FormData, cancelToken?: CancelToken) {
  return request.post<{
    code: number
    data: {
      url: string
    }
  }>({
    url: '/api/file/upload',
    params,
    cancelToken
  })
}

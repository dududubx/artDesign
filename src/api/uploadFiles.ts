import request from '@/utils/http'
import { CancelToken } from 'axios'

// 上传切片文件
export function fetchUploadFiles(params: FormData, cancelToken?: CancelToken) {
  return request.post<{
    code: number
    data: {
      url: string
    }
  }>({
    url: '/api/file/uoload/chunk',
    params,
    cancelToken
  })
}

// 上传单文件
export function uploadSingleFile(params: FormData, cancelToken?: CancelToken){
  return request.post<{
    code: number
    data: {
      url: string
    }
  }>({
    url: '/api/file/uoload/simple',
    params,
    cancelToken
  })
}

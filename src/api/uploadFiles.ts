import request from '@/utils/http'

// 上传文件
export function fetchUploadFiles(params: FormData) {
  return request.post<{
    code: number
    data: {
      url: string
    }
  }>({
    url: '/api/file/upload',
    params
  })
}

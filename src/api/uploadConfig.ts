import request from '@/utils/http'
import { useUploadConfigStore } from '@/store/modules/uploadConfig'

// 获取上传配置
export const getUploadConfig = (params: any) =>
  request
    .get<Http.BaseResponse<any>>({
      url: '/store/setting/detail',
      params
    })
    .then((res) => {
      if (res.code === 200) {
        useUploadConfigStore().setUploadConfig(res.data)
      }
    })

// 修改上传配置
export function updateUploadConfig(data: any) {
  return request
    .post<Http.BaseResponse<any>>({
      url: '/store/setting/update',
      data
    })
    .then((res) => {
      if (res.code == 200) {
        getUploadConfig({})
      }
      return Promise.resolve<Http.BaseResponse<any>>(res)
    })
}

export function getOssUploadConfig(data: any) {
  return request.get<
    Http.BaseResponse<{
      ossAuthInfo: string
      retryInterval: number
    }>
  >({
    url: `/api/sts/credentials/refresh?task_id=${data.task_id}`
  })
}

// 初始化上传
export function initUpload(data: any) {
  return request.post<Http.BaseResponse<any>>({
    url: '/api/file/uoload/init',
    data
  })
}

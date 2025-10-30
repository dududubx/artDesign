import request from '@/utils/http'
import type { FileCategory } from '@/types/fileManage'

export function getCategoryList(params: any) {
  return request.post<Http.BaseResponse<FileCategory[]>>({
    url: '/api/file_category/list',
    params
  })
}

export function addCategory(params: FileCategory) {
  return request.post<void>({
    url: '/api/file_category/add',
    params
  })
}

export function editCategory(params: FileCategory) {
  return request.post<void>({
    url: '/api/file_category/edit',
    params
  })
}

export function deleteCategory(params: { id: number }) {
  return request.post<void>({
    url: '/api/file_category/delete',
    params
  })
}

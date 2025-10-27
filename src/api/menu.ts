import request from '@/utils/http'
import type { MenuFormData } from '@/types/menu'

// 获取系统菜单信息
export function fetchGetSystemMenu(params: { name: string }) {
  return request.get<MenuFormData[]>({
    url: '/api/system/menus',
    params
  })
}

// 新增系统菜单信息
export function fetchAddSystemMenu(data: MenuFormData) {
  return request.post<Http.BaseResponse<any>>({
    url: '/api/menus/add',
    data
  })
}

// 修改系统菜单信息
export function fetchEditSystemMenu(data: MenuFormData) {
  return request.post<Http.BaseResponse<any>>({
    url: '/api/menus/edit',
    data
  })
}

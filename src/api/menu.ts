import request from '@/utils/http'

// 获取系统菜单信息
export function fetchGetSystemMenu(params: Api.SystemManage.UserSearchParams) {
  return request.get({
    url: '/api/system/menus',
    params
  })
}

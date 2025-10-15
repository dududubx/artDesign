import request from '@/utils/http'
import { AppRouteRecord, menuTypeRoute } from '@/types/router'
import { asyncRoutes } from '@/router/routes/asyncRoutes'
import { menuDataToRouter } from '@/router/utils/menuToRouter'

/**
 * 动态导入 views 目录下所有 .vue 组件
 */
const modules: Record<string, () => Promise<any>> = import.meta.glob('../views/**/*.vue')

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

//新增角色
export function fetchAddRole(params: Api.SystemManage.RoleListItem) {
  return request.post<Http.BaseResponse>({
    url: '/api/role/add',
    params
  })
}

//编辑角色
export function fetchEditRole(params: Api.SystemManage.RoleListItem) {
  return request.post({
    url: '/api/role/edit',
    params
  })
}

//删除角色
export function fetchDeleteRole(params: { id: number | string }) {
  return request.post({
    url: '/api/role/delete',
    params
  })
}
interface MenuResponse {
  menuList: AppRouteRecord[]
}

interface MenuParams {
  menu: menuTypeRoute[]
}

// 获取菜单数据（模拟）
export async function fetchGetMenuList(delay = 300): Promise<MenuResponse> {
  try {
    // // 模拟接口返回的菜单数据
    // const menuData = asyncRoutes
    // // 处理菜单数据
    // const menuList = menuData.map((route) => menuDataToRouter(route))
    // // 模拟接口延迟
    // await new Promise((resolve) => setTimeout(resolve, delay))
    let menuList: AppRouteRecord[] = []
    const response = await request.get<{
      data: MenuParams
    }>({
      url: '/api/menus/routes',
      params: {}
    })
    const setMenuList = (menus: MenuParams['menu']): AppRouteRecord[] => {
      const menuList: AppRouteRecord[] = []
      menus.forEach((menu) => {
        if (menu.type == 3) {
          console.log('menu:', menu)
          return
        }
        // 构建可能的路径
        const fullPath = `../views${menu.component_path}.vue`
        const fullPathWithIndex = `../views${menu.component_path}/index.vue`
        // 先尝试直接路径，再尝试添加/index的路径
        const module = modules[fullPath] || modules[fullPathWithIndex]
        const newMenu: AppRouteRecord = {
          id: menu.id,
          name: menu.perms == '1' ? `menu_${menu.id}` : menu.name,
          path: menu.route_path.startsWith('/') ? `${menu.route_path}` : `/${menu.route_path}`,
          parentId: menu.parent_id,
          component:
            menu.component_path == ''
              ? menu.component_path
              : !module
                ? '/exception/404/index'
                : menu.component_path,
          children: menu.children ? setMenuList(menu.children) : [],
          meta: {
            title: menu.name,
            icon: menu.icon,
            keepAlive: menu.keepalive === 1,
            hidden: menu.hidden === 1 || menu.type == 3,
            link: menu.link,
            authList: [
              {
                title: '新增',
                authMark: 'add'
              },
              {
                title: '编辑',
                authMark: 'edit'
              },
              {
                title: '删除',
                authMark: 'delete'
              }
            ]
          }
        }
        menuList.push(newMenu)
      })
      return menuList
    }
    menuList = setMenuList(response.data.menu)
    console.log('fetched menu list:', menuList)
    return { menuList }
  } catch (error) {
    throw error instanceof Error ? error : new Error('获取菜单失败')
  }
}

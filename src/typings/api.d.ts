/**
 * namespace: Api
 *
 * 所有接口相关类型定义
 * 在.vue文件使用会报错，需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size' | 'pageIndex' | 'pageSize'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      username: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      data: {
        token: string
      }
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userid: number
      username: string
      email: string
      avatar?: string
      nickname: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户状态 */
    type UserStatus = '1' | '2' | '3' | '4' // 1: 在线 2: 离线 3: 异常 4: 注销

    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: UserStatus
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      id?: number
      name: string
      role_code: string
      remark: string
      status: number
      create_time: string
      sort: number
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'id' | 'name' | 'role_code' | 'remark' | 'status' | 'sort'> &
        Api.Common.CommonSearchParams
    >
  }
}

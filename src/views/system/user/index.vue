<!-- 用户管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的 高级表格示例 -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import { ElMessageBox, ElTag, ElImage, ElButton } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { fetchGetUserList } from '@/api/system-manage'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { Edit, Delete } from '@element-plus/icons-vue'

  defineOptions({ name: 'User' })
  const { $message } = getCurrentInstance()!.proxy as ComponentPublicInstance
  type UserListItem = Api.SystemManage.UserListItem

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    name: undefined,
    level: 'vip',
    date: undefined,
    daterange: undefined,
    status: undefined
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '启用' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'danger' as const, text: '禁用' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }
  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      // 排除 apiParams 中的属性
      excludeParams: ['daterange'],
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'avatar',
          label: '用户名',
          width: 180,
          formatter: (row) => {
            return h('div', { class: 'user', style: 'display: flex; align-items: center' }, [
              h(ElImage, {
                class: 'avatar',
                src: row.avatar,
                previewSrcList: [row.avatar],
                // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                previewTeleported: true
              }),
              h('div', {}, [
                h('p', { class: 'user-name' }, row.nickname),
                h('p', { class: 'email' }, row.username)
              ])
            ])
          }
        },
        {
          prop: 'username',
          label: '角色'
        },
        {
          prop: 'real_name',
          label: '姓名'
        },
        {
          prop: 'gender',
          label: '性别'
        },
        { prop: 'phone', label: '手机号' },
        { prop: 'wechat', label: '微信号' },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'create_time',
          label: '创建日期',
          sortable: true,
          showOverflowTooltip: true
        },
        {
          prop: 'operation',
          align: 'center',
          label: '操作',
          width: 140,
          fixed: 'right',
          formatter: (row) =>
            h(
              'div',
              {
                class: 'art-table-operation'
              },
              [
                h(
                  ElButton,
                  {
                    text: true,
                    type: 'primary',
                    icon: Edit,
                    onClick: () => showDialog('edit', row)
                  },
                  {
                    default: () => '编辑'
                  }
                ),
                h(
                  ElButton,
                  {
                    text: true,
                    type: 'danger',
                    icon: Delete,
                    onClick: () => deleteUser(row)
                  },
                  {
                    default: () => '删除'
                  }
                )
              ]
            )
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换头像
      dataTransformer: (records: any) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 使用本地头像替换接口返回的头像
        return records.map((item: any, index: number) => {
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
          }
        })
      }
    }
  })
  console.log('columns:', data.value)
  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
    const { daterange, ...filtersParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    // 搜索参数赋值
    Object.assign(searchParams, { ...filtersParams, startTime, endTime })
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: Form.DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    console.log('删除用户:', row)
    ElMessageBox.confirm(`确定要注销该用户吗？`, '注销用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      $message({
        type: 'success',
        message: `注销成功`
      })
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style lang="scss" scoped>
  // @use '@styles/basicTable.scss' as *;
  .user-page {
    :deep(.user) {
      .avatar {
        width: 50px;
        height: 50px;
        margin-left: 0;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
  // :deep(.art-search-bar) {
  //   // padding: 0;
  //   border: none !important;
  //   width: 100%;
  //   box-sizing: border-box;
  //   // .el-form-item--default {
  //   //   margin-bottom: 0;
  //   // }
  //   .action-buttons-wrapper {
  //     // margin-bottom: 0 !important;
  //     justify-content: flex-start !important;
  //   }

  //   .el-form-item--default {
  //     background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
  //     border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
  //     border: 1px solid var(--el-border-color);
  //     --el-input-inner-height: calc(var(--el-input-height, 32px) - 2px);
  //     align-items: center;

  //     label,
  //     .el-form-item__label {
  //       // padding: 0 0;
  //       padding: 0 0 0 12px;
  //       height: 34px;
  //       line-height: 34px;
  //       text-align: left;
  //       color: var(--el-text-color-placeholder);
  //       justify-content: flex-start;
  //       font-size: 12px;
  //       width: fit-content !important;
  //     }

  //     .el-input__wrapper {
  //       box-shadow: none;
  //       padding-left: 3px;
  //     }

  //     .el-input__inner {
  //       color: var(--el-text-color-primary);
  //     }

  //     .el-select__wrapper {
  //       box-shadow: none;
  //     }
  //   }

  //   .is-focused {
  //     border-color: var(--el-color-primary);
  //   }
  // }
</style>

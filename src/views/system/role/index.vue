<template>
  <div class="role-page art-full-height">
    <RoleSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></RoleSearch>

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增角色</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 角色编辑弹窗 -->
    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="refreshData"
    />

    <!-- 菜单权限弹窗 -->
    <RolePermissionDialog
      v-model="permissionDialog"
      :role-data="currentRoleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { Position, Edit, Delete } from '@element-plus/icons-vue'
  import { useTable } from '@/composables/useTable'
  import { fetchGetRoleList, fetchDeleteRole } from '@/api/system-manage'
  import RoleSearch from './modules/role-search.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import RolePermissionDialog from './modules/role-permission-dialog.vue'

  defineOptions({ name: 'Role' })

  type RoleListItem = Api.SystemManage.RoleListItem

  // 搜索表单
  const searchForm = ref({
    roleName: undefined,
    roleCode: undefined,
    description: undefined,
    enabled: undefined,
    daterange: undefined
  })

  const showSearchBar = ref(true)

  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const currentRoleData = ref<RoleListItem | undefined>(undefined)

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
      apiFn: fetchGetRoleList,
      apiParams: {
        pageIndex: 1,
        pageSize: 20
      },
      paginationKey: {
        current: 'pageIndex',
        size: 'pageSize'
      },
      // 排除 apiParams 中的属性
      excludeParams: ['daterange'],
      columnsFactory: () => [
        { type: 'selection', width: 38 },
        {
          prop: 'id',
          label: '角色ID'
        },
        {
          prop: 'name',
          label: '角色名称',
          minWidth: 120
        },
        {
          prop: 'role_code',
          label: '角色编码',
          minWidth: 120
        },
        {
          prop: 'remark',
          label: '角色描述',
          showOverflowTooltip: true
        },
        {
          prop: 'status',
          label: '角色状态',
          formatter: (row) => {
            const statusConfig =
              row.status == 1
                ? { type: 'success', text: '启用' }
                : { type: 'warning', text: '禁用' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'warning' },
              () => statusConfig.text
            )
          }
        },
        {
          prop: 'create_time',
          label: '创建日期',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 230,
          align: 'center',
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
                    icon: Position,
                    onClick: () => buttonMoreClick('permission', row)
                  },
                  {
                    default: () => '分配权限'
                  }
                ),
                h(
                  ElButton,
                  {
                    text: true,
                    type: 'primary',
                    icon: Edit,
                    onClick: () => buttonMoreClick('edit', row)
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
                    onClick: () => buttonMoreClick('delete', row)
                  },
                  {
                    default: () => '删除'
                  }
                )
              ]
            )
        }
      ]
    }
  })

  const dialogType = ref<'add' | 'edit'>('add')

  const showDialog = (type: 'add' | 'edit', row?: RoleListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentRoleData.value = row
  }

  /**
   * 搜索处理
   * @param params 搜索参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
    const { daterange, ...filtersParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    // 搜索参数赋值
    Object.assign(searchParams, { ...filtersParams, startTime, endTime })
    getData()
  }

  const buttonMoreClick = (item: string, row: RoleListItem) => {
    switch (item) {
      case 'permission':
        showPermissionDialog(row)
        break
      case 'edit':
        showDialog('edit', row)
        break
      case 'delete':
        deleteRole(row)
        break
    }
  }

  const showPermissionDialog = (row?: RoleListItem) => {
    permissionDialog.value = true
    currentRoleData.value = row
  }

  const deleteRole = (row: RoleListItem) => {
    ElMessageBox.confirm(`确定删除角色"${row.name}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        // TODO: 调用删除接口
        await fetchDeleteRole({
          id: row!.id || ''
        })
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>

<style lang="scss" scoped>
  .role-page {
    padding-bottom: 15px;
  }
  :deep(.art-table-operation) {
    display: flex;
    align-items: center;
    .el-button--danger.is-text,
    .el-button--primary.is-text {
      padding: 0 !important;
    }
  }
</style>

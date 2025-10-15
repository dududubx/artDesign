<template>
  <div class="menu-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton v-auth="'add'" @click="handleAddMenu" v-ripple> 添加菜单 </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
          <!-- <ElButton v-if="hasAuth('add')" @click="handleAddMenu" v-ripple> 添加菜单 </ElButton> -->
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="data"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      >
        <!-- 操作列 -->
        <template #operation="{ row }">
          <div class="status-one">
            <div class="status-btn">
              <el-button type="primary" :icon="Plus" text @click="handleAddAuth(row)"
                >新增</el-button
              >
              <el-button type="primary" :icon="Edit" text @click="handleEditMenu(row)"
                >编辑</el-button
              >
              <el-button type="danger" :icon="Delete" text @click="handleDeleteMenu()"
                >删除</el-button
              >
            </div>
          </div>
        </template>
      </ArtTable>

      <!-- 菜单弹窗 -->
      <MenuDialog
        v-model:visible="dialogVisible"
        :menu-data="menuTreeData"
        :type="dialogType"
        :editData="editData"
        :lockType="lockMenuType"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useMenuStore } from '@/store/modules/menu'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { formatMenuTitle } from '@/router/utils/utils'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/composables/useTable'
  import type { AppRouteRecord, menuTypeRoute } from '@/types/router'
  import { useAuth } from '@/composables/useAuth'
  import MenuDialog from './modules/menu-dialog.vue'
  import { fetchGetSystemMenu } from '@/api/menu'
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'

  defineOptions({ name: 'Menus' })

  type menuFormData = AppRouteRecord & {
    id: number
    parentId: string
    name: string
  }
  enum menuType {
    '目录' = 1,
    '菜单' = 2,
    '按钮' = 3,
    '内嵌' = 4
  }
  const { hasAuth } = useAuth()
  const { menuList } = storeToRefs(useMenuStore())
  const menuTreeData = ref<menuFormData[]>([])
  const expenMenuData = (items: AppRouteRecord[]): menuFormData[] => {
    const returnData = items.map((item) => {
      const newItem = {
        ...item,
        label: formatMenuTitle(item.meta?.title || ''),
        value: item.id
      }
      if (item.children?.length) {
        newItem.children = expenMenuData(item.children)
      }
      return newItem
    }) as menuFormData[]
    return returnData
  }

  menuTreeData.value = expenMenuData(menuList.value)
  // 状态管
  // const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<string>('2')
  const editData = ref<menuTypeRoute | any>(null)
  const lockMenuType = ref(false)

  // 搜索相关
  const initialSearchState = {
    name: '',
    route: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const formItems = computed(() => [
    {
      label: '菜单名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '路由地址',
      key: 'route',
      type: 'input',
      props: { clearable: true }
    }
  ])

  // 菜单类型工具函数
  const getMenuTypeTag = (row: menuTypeRoute) => {
    if (row.type == 3) return 'danger'
    if (row.type == 1) return 'info'
    if (row.type == 2) return 'primary'
    if (row.type == 2) return 'warning'
    return 'info'
  }

  const getMenuTypeText = (row: menuTypeRoute) => {
    if (menuType[row.type]) {
      return menuType[row.type]
    }
    return '未知'
  }
  const { columns, columnChecks, loading, refreshData, data } = useTable({
    core: {
      apiFn: fetchGetSystemMenu,
      apiParams: {
        current: 1,
        size: 20,
        userName: '',
        userPhone: '',
        userEmail: ''
      },
      columnsFactory: () => [
        {
          prop: 'name',
          label: '菜单名称',
          minWidth: 120
        },
        {
          prop: 'type',
          label: '菜单类型',
          formatter: (row: menuTypeRoute) => {
            return h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row))
          }
        },
        {
          prop: 'path',
          label: '路由',
          formatter: (row: menuTypeRoute) => {
            return row.route_path || row.link || ''
          }
        },
        {
          prop: 'meta.authList',
          label: '权限标识',
          formatter: (row: menuTypeRoute) => {
            const authButtons = row.children?.filter((child) => child.type == 3) || []
            if (!authButtons?.length) {
              return ''
            }
            return `${authButtons?.length} 个权限标识`
          }
        },
        {
          prop: 'date',
          label: '编辑时间',
          formatter: () => '2022-3-12 12:00:00'
        },
        {
          prop: 'status',
          label: '状态',
          formatter: () => h(ElTag, { type: 'success' }, () => '启用')
        },
        {
          prop: 'operation',
          label: '操作',
          width: 220,
          align: 'center',
          useSlot: true,
          formatter: (row: menuTypeRoute) => {
            const buttonStyle = { style: 'text-align: right' }

            // if (row.meta?.isAuthButton) {
            //   return h('div', buttonStyle, [
            //     h(ArtButtonTable, {
            //       type: 'edit',
            //       onClick: () => handleEditAuth(row)
            //     }),
            //     h(ArtButtonTable, {
            //       type: 'delete',
            //       onClick: () => handleDeleteAuth()
            //     })
            //   ])
            // }

            return h('div', buttonStyle, [
              h(ArtButtonTable, {
                type: 'add',
                onClick: () => handleAddAuth(row),
                title: '新增菜单'
              }),
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => handleEditMenu(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDeleteMenu()
              })
            ])
          }
        }
      ]
    }
  })
  // 事件处理
  const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    refreshData()
  }

  const handleSearch = () => {
    Object.assign(appliedFilters, { ...formFilters })
    refreshData()
  }

  const handleRefresh = () => {
    refreshData()
  }
  // 工具函数
  const deepClone = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj)
    if (Array.isArray(obj)) return obj.map((item) => deepClone(item))

    const cloned: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  const convertAuthListToChildren = (items: AppRouteRecord[]): AppRouteRecord[] => {
    return items.map((item) => {
      const clonedItem = deepClone(item)

      if (clonedItem.children?.length) {
        clonedItem.children = convertAuthListToChildren(clonedItem.children)
      }

      if (item.meta?.authList?.length) {
        const authChildren: AppRouteRecord[] = item.meta.authList.map(
          (auth: { title: string; authMark: string }) => ({
            path: `${item.path}_auth_${auth.authMark}`,
            name: `${String(item.name)}_auth_${auth.authMark}`,
            meta: {
              title: auth.title,
              authMark: auth.authMark,
              isAuthButton: true,
              parentPath: item.path
            }
          })
        )

        clonedItem.children = clonedItem.children?.length
          ? [...clonedItem.children, ...authChildren]
          : authChildren
      }

      return clonedItem
    })
  }

  const searchMenu = (items: AppRouteRecord[]): AppRouteRecord[] => {
    const results: AppRouteRecord[] = []

    for (const item of items) {
      const searchName = appliedFilters.name?.toLowerCase().trim() || ''
      const searchRoute = appliedFilters.route?.toLowerCase().trim() || ''
      const menuTitle = formatMenuTitle(item.meta?.title || '').toLowerCase()
      const menuPath = (item.path || '').toLowerCase()
      const nameMatch = !searchName || menuTitle.includes(searchName)
      const routeMatch = !searchRoute || menuPath.includes(searchRoute)

      if (item.children?.length) {
        const matchedChildren = searchMenu(item.children)
        if (matchedChildren.length > 0) {
          const clonedItem = deepClone(item)
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (nameMatch && routeMatch) {
        results.push(deepClone(item))
      }
    }

    return results
  }

  // 过滤后的表格数据
  const filteredTableData = computed(() => {
    const searchedData = searchMenu(data.value)
    return convertAuthListToChildren(searchedData)
  })

  // 弹窗操作处理
  const handleAddMenu = () => {
    dialogType.value = '2'
    editData.value = null
    lockMenuType.value = true
    dialogVisible.value = true
  }

  const handleAddAuth = (row: menuTypeRoute) => {
    dialogType.value = '2'
    editData.value = {
      parent_id: row.parent_id
    }
    lockMenuType.value = false
    dialogVisible.value = true
  }

  const handleEditMenu = (row: AppRouteRecord) => {
    dialogType.value = '2'
    editData.value = row
    lockMenuType.value = true
    dialogVisible.value = true
  }

  const handleEditAuth = (row: AppRouteRecord) => {
    dialogType.value = '2'
    editData.value = {
      title: row.meta?.title,
      authMark: row.meta?.authMark
    }
    lockMenuType.value = false
    dialogVisible.value = true
  }

  const handleSubmit = (formData: any) => {
    // 这里可以调用API保存数据
    refreshData()
  }

  const handleDeleteMenu = async () => {
    try {
      await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      ElMessage.success('删除成功')
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  const handleDeleteAuth = async () => {
    try {
      await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      ElMessage.success('删除成功')
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 展开/收起功能
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && filteredTableData.value) {
        const processRows = (rows: AppRouteRecord[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(filteredTableData.value)
      }
    })
  }

  // 生命周期
  onMounted(() => {
    // getTableData()
  })
</script>

<style lang="scss" scoped>
  .menu-page {
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }

    :deep(.small-btn) {
      height: 30px !important;
      padding: 0 10px !important;
      font-size: 12px !important;
    }
    :deep(.status-btn) {
      display: flex;
      align-items: center;
      .el-button--danger.is-text,
      .el-button--primary.is-text {
        padding: 0 !important;
      }
    }
  }
</style>

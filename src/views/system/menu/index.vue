<template>
  <div class="menu-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="resetSearchParams"
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
              <el-button
                type="primary"
                v-if="row.type != 3"
                :icon="Plus"
                text
                @click="handleAddAuth(row)"
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
        :isEdit="isEdit"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useMenuStore } from '@/store/modules/menu'
  import { ElMessageBox, ElTag } from 'element-plus'
  import { formatMenuTitle } from '@/router/utils/utils'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/composables/useTable'
  import type { AppRouteRecord } from '@/types/router'
  import { useAuth } from '@/composables/useAuth'
  import MenuDialog from './modules/menu-dialog.vue'
  import { fetchGetSystemMenu } from '@/api/menu'
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'
  import type { MenuFormData } from '@/types/menu'

  defineOptions({ name: 'Menus' })
  enum menuType {
    '目录' = 1,
    '菜单' = 2,
    '按钮' = 3,
    '内嵌' = 4
  }
  const { $message } = getCurrentInstance()!.proxy as ComponentPublicInstance
  const { hasAuth } = useAuth()
  const { menuList } = storeToRefs(useMenuStore())
  const menuTreeData = ref<MenuFormData[]>([])

  // 状态管
  // const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<string>('2')
  const editData = ref<MenuFormData | any>(null)
  const lockMenuType = ref(false)

  // 搜索相关
  const initialSearchState = {
    name: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const formItems = computed(() => [
    {
      label: '菜单名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    }
  ])

  // 菜单类型工具函数
  const getMenuTypeTag = (row: MenuFormData) => {
    if (row.type == 3) return 'danger'
    if (row.type == 1) return 'info'
    if (row.type == 2) return 'primary'
    if (row.type == 2) return 'warning'
    return 'info'
  }

  const getMenuTypeText = (row: MenuFormData) => {
    if (menuType[row!.type as number]) {
      return menuType[row!.type as number]
    }
    return '未知'
  }
  const { columns, columnChecks, loading, refreshData, data, resetSearchParams, searchParams } =
    useTable({
      core: {
        apiFn: fetchGetSystemMenu,
        apiParams: {},
        excludeParams: ['current', 'size'],
        columnsFactory: () => [
          {
            prop: 'name',
            label: '菜单名称',
            minWidth: 120
          },
          {
            prop: 'type',
            label: '菜单类型',
            formatter: (row: MenuFormData) => {
              return h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row))
            }
          },
          {
            prop: 'route_path',
            label: '路由',
            formatter: (row: MenuFormData) => {
              return row.route_path || row.link || ''
            }
          },
          {
            prop: 'perms',
            label: '权限标识'
          },
          {
            prop: 'create_time',
            label: '创建时间',
            showOverflowTooltip: true,
            minWidth: 120
          },
          {
            prop: 'status',
            label: '状态',
            formatter: (row: MenuFormData) =>
              h(ElTag, { type: row.status == 1 ? 'success' : 'danger' }, () =>
                row.status == 1 ? '启用' : '禁用'
              )
          },
          {
            prop: 'operation',
            label: '操作',
            width: 220,
            align: 'center',
            useSlot: true,
            formatter: (row: MenuFormData) => {
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
  const filterBtnType = (arr: MenuFormData[]): MenuFormData[] => {
    return arr.map((item: MenuFormData) => {
      if (item.children?.length) {
        item.children = item.children.filter((child) => child.type != 3)
        filterBtnType(item.children)
      }
      return item
    }) as MenuFormData[]
  }
  watch(
    () => data.value,
    (newVal) => {
      const clonedData = deepClone(newVal)
      menuTreeData.value = [
        {
          name: '顶级菜单',
          id: 0,
          children: filterBtnType(clonedData),
          route_path: '/'
        }
      ]
      console.log(menuTreeData.value)
    }
  )

  // 事件处理
  const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    refreshData()
  }

  const handleSearch = () => {
    // 搜索参数赋值
    Object.assign(searchParams, { ...formFilters })
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
      const menuTitle = formatMenuTitle(item.meta?.title || '').toLowerCase()
      const nameMatch = !searchName || menuTitle.includes(searchName)

      if (item.children?.length) {
        const matchedChildren = searchMenu(item.children)
        if (matchedChildren.length > 0) {
          const clonedItem = deepClone(item)
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (nameMatch) {
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
  const isEdit = ref(false)
  // 弹窗操作处理
  const handleAddMenu = () => {
    dialogType.value = '2'
    editData.value = null
    isEdit.value = false
    lockMenuType.value = true
    dialogVisible.value = true
  }

  const handleAddAuth = (row: MenuFormData) => {
    dialogType.value = '2'
    isEdit.value = false
    editData.value = {
      parent_id: row.id
    }
    lockMenuType.value = false
    dialogVisible.value = true
  }

  const handleEditMenu = (row: MenuFormData) => {
    dialogType.value = '2'
    isEdit.value = true
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
      $message({
        type: 'success',
        message: `删除成功`
      })
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        $message({
          type: 'error',
          message: `删除失败`
        })
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
      $message({
        type: 'success',
        message: `删除成功`
      })
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        $message({
          type: 'error',
          message: `删除失败`
        })
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

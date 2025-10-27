<template>
  <div class="menu-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="searchParams"
      :items="formItems"
      :showExpand="false"
      @reset="resetSearchParams"
      @search="refreshData"
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
          <ElButton @click="handleAddMenu" v-ripple> 添加分类 </ElButton>
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
                v-if="!row.parent_id"
                :icon="Plus"
                text
                @click="handleAddAuth(row)"
                >新增</el-button
              >
              <el-button type="primary" :icon="Edit" text @click="handleEditMenu(row)"
                >编辑</el-button
              >
              <el-button type="danger" :icon="Delete" text @click="handleDeleteMenu(row)"
                >删除</el-button
              >
            </div>
          </div>
        </template>
      </ArtTable>

      <!-- 菜单弹窗 -->
      <categoryDialog
        v-model:visible="dialogVisible"
        :cartegoryData="data"
        :editData="editData"
        :isEdit="isEdit"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessageBox } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import type { FileCategory } from '@/types/fileManage'
  import { getCategoryList, deleteCategory } from '@/api/file-manage'
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'
  import categoryDialog from './modules/categoryDialog.vue'

  defineOptions({ name: 'Category' })
  const { $message } = getCurrentInstance()!.proxy as ComponentPublicInstance
  // 状态管
  // const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const editData = ref<FileCategory | any>(null)

  const formItems = computed(() => [
    {
      label: '分类名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    }
  ])
  const { columns, columnChecks, loading, refreshData, data, searchParams, resetSearchParams } =
    useTable({
      core: {
        apiFn: getCategoryList,
        apiParams: {
          name: ''
        },
        columnsFactory: () => [
          {
            prop: 'id',
            label: '分类id',
            minWidth: 120
          },
          {
            prop: 'name',
            label: '分类名称'
          },
          {
            prop: 'parent_id',
            label: '父级id'
          },
          {
            prop: 'sort',
            label: '排序号'
          },
          {
            prop: 'remark',
            label: '备注',
            showOverflowTooltip: true,
            minWidth: 120
          },
          {
            prop: 'create_time',
            label: '创建时间',
            showOverflowTooltip: true,
            minWidth: 120
          },
          {
            prop: 'operation',
            label: '操作',
            width: 220,
            align: 'center',
            useSlot: true
          }
        ]
      }
    })
  const handleRefresh = () => {
    refreshData()
  }
  const isEdit = ref(false)
  // 弹窗操作处理
  const handleAddMenu = () => {
    editData.value = null
    isEdit.value = false
    dialogVisible.value = true
  }

  const handleAddAuth = (row: FileCategory) => {
    isEdit.value = false
    editData.value = {
      parent_id: row.id
    }
    dialogVisible.value = true
  }

  const handleEditMenu = (row: FileCategory) => {
    isEdit.value = true
    editData.value = row
    dialogVisible.value = true
  }

  const handleSubmit = (formData: any) => {
    // 这里可以调用API保存数据
    refreshData()
  }

  const handleDeleteMenu = async (row: FileCategory) => {
    try {
      await ElMessageBox.confirm('确定要删除该分类吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteCategory({ id: row.id as number })
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
      if (tableRef.value?.elTableRef && data.value) {
        const processRows = (rows: FileCategory[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(data.value)
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

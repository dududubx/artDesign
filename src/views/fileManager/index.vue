<template>
  <div class="file-manager art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      ref="searchBarRef"
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
        @refresh="handleSearch"
      >
        <template #left>
          <ElButton @click="handleAddFile" v-ripple> 新增 </ElButton>
          <ElButton @click="chooseImge" v-ripple> 选择图片 </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="data"
        :stripe="false"
      >
      </ArtTable>

      <!-- 菜单弹窗 -->
      <addFile
        v-model="dialogVisible"
        :editData="currentRow"
        :dialogType="dialogType"
        :cateList="cateList"
        @success="handleSearch"
        @relfeshCateList="getCategoryListData"
      />
      <ArtImgDialog v-model:visible="imgDialogVisible" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTableColumns } from '@/composables/useTableColumns'
  import { ElTag, ElImage, ElButton } from 'element-plus'
  import { Delete, Edit } from '@element-plus/icons-vue'
  import addFile from './modules/addFile.vue'
  import { getCategoryList } from '@/api/file-manage'
  import type { FileCategory } from '@/types/fileManage'

  declare interface fileData {
    id: number
    filePath: string
    name: string
    way: string
    fileType: string
    size: number
    suffix: string
    createTime: string
  }
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentRow = ref<fileData>()
  const loading = ref(false)
  const imgDialogVisible = ref(false)
  const data = ref<fileData[]>([
    {
      id: 1,
      filePath: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      name: '文件1',
      way: '本地',
      fileType: '图片',
      size: 1024,
      createTime: '2022-01-01 12:00:00',
      suffix: 'jpg'
    }
  ])
  const { columns, columnChecks } = useTableColumns(() => [
    { type: 'selection', width: 38 },
    {
      prop: 'id',
      label: '文件ID',
      minWidth: 120
    },
    {
      prop: 'filePath',
      label: '文件预览',
      formatter: (row: any) => {
        return h(ElImage, {
          src: row.filePath,
          class: 'file-tag',
          previewTeleported: true,
          previewSrcList: [row.filePath]
        })
      }
    },
    {
      prop: 'name',
      label: '文件名称'
    },
    {
      prop: 'way',
      label: '存储方式',
      formatter: (row: any) => {
        return h(ElTag, { type: 'info' }, () => row.way)
      }
    },
    {
      prop: 'fileType',
      label: '文件类型',
      formatter: (row: any) => {
        return h(ElTag, { type: 'info' }, () => row.fileType)
      }
    },
    {
      prop: 'size',
      label: '文件大小(字节)'
    },
    {
      prop: 'suffix',
      label: '文件后缀'
    },
    {
      prop: 'createTime',
      label: '上传时间',
      minWidth: 120
    },
    {
      prop: 'operation',
      label: '操作',
      width: 140,
      align: 'center',
      formatter: (row: any) => {
        return h(
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
    }
  ])
  const formFilters = reactive({
    group: ''
  })
  const testOptions = ref<Array<{ [key: string]: any }>>([])
  const formItems = computed(() => [
    {
      label: '文件名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '文件分组',
      key: 'group',
      type: 'treeselect',
      props: {
        clearable: true,
        data: cateList.value,
        props: { label: 'name', value: 'id' },
        renderAfterExpand: false,
        checkOnClickNode: true,
        expandOnClickNode: false,
        nodeKey: 'id',
        onNodeClick: onTreeNodeClick,
        ref: 'treeRef',
        key: 'groupTree',
        class: 'art-file-tree-select'
      }
    }
  ])
  const onTreeNodeClick = (data: any) => {
    formFilters.group = data.id
    // 点击父节点后尝试关闭下拉（兼容不同组件实现）
    nextTick(() => {
      const dom = document.querySelector('.art-file-tree-select input') as HTMLInputElement
      if (dom) {
        dom.click()
        dom.blur()
        return
      }
      // 最后兜底
      document.body.click()
    })
  }
  const buttonMoreClick = (type: string, row: any) => {
    if (type == 'edit') {
      dialogVisible.value = true
      dialogType.value = 'edit'
      currentRow.value = row
      return
    }
  }
  const handleReset = () => {}

  const handleSearch = () => {
    // 搜索参数赋值
    // Object.assign(searchParams, { ...formFilters })
    // refreshData()
  }
  const handleAddFile = () => {
    dialogType.value = 'add'
    dialogVisible.value = true
  }
  const cateList = ref<FileCategory[]>([])
  const searchList = ref<{ label: string; value: string }[]>([])
  const getCategoryListData = async () => {
    const res = await getCategoryList({})
    cateList.value = [
      {
        name: '全部分组',
        id: 0,
        children: res.data
      }
    ]
    const search = (data: FileCategory[]) => {
      data.forEach((item) => {
        if (!item.children) {
          searchList.value.push({
            label: item.name,
            value: item.id as string
          })
        } else {
          search(item.children)
        }
      })
    }
    search(res.data)
  }
  const chooseImge = () => {
    imgDialogVisible.value = true
  }
  onMounted(() => {
    testOptions.value = [
      { label: '分组1', value: 1 },
      { label: '分组2', value: 2 },
      { label: '分组3', value: 3 }
    ]
    getCategoryListData()
  })
</script>

<style lang="scss" scoped>
  :deep(.file-tag) {
    width: 40px;
    height: 40px;
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

<template>
  <ElDialog v-model="visible" title="图片库" width="80%" align-center @close="handleClose">
    <div class="img-box">
      <div class="img-box_left">
        <div class="left-title"> 图片分类 </div>
        <div class="left-list">
          <ElTree
            node-key="id"
            :data="imgCateTreeList"
            default-expand-all
            :expand-on-click-node="false"
            :check-on-click-node="true"
            @node-click="handleNodeClick"
            :props="{ label: 'name' }"
          >
          </ElTree>
        </div>
      </div>
      <div class="img-box_right">
        <div class="right-top">
          <ElInput
            class="img-search"
            v-model="imgName"
            v-debounce="{ handler: onSearchValue, wait: 300, event: 'update:modelValue' }"
            placeholder="搜索图片名称"
            clearable
          >
          </ElInput>
          <ElButton type="primary" @click="handleUpload">上传</ElButton>
        </div>

        <div class="right-list">
          <div
            class="img-list_item"
            v-for="item in imgList"
            :key="item.id"
            @click="checkHandle(item)"
          >
            <div class="is-checked" v-if="item.checked">
              <el-icon><Check /></el-icon>
            </div>
            <ElImage :src="item.url" fit="contain">
              <template #error>
                <div class="image-viewer-slot image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </ElImage>
            <div class="item-name">{{ item.name }}</div>
          </div>
        </div>
        <ElPagination
          :total="pagination?.total"
          :page-size="pagination?.size"
          :current-page="pagination?.current"
          layout="prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </div>
    </template>
  </ElDialog>
  <addFile
    v-model="dialogVisible"
    dialogType="add"
    :cateList="cateList"
    @success="handleSearch"
    @relfeshCateList="getCategoryListData"
  />
</template>

<script setup lang="ts">
  import type { FileCategory } from '@/types/fileManage'
  import { getCategoryList } from '@/api/file-manage'
  import addFile from '@/views/fileManager/modules/addFile.vue'
  defineOptions({
    name: 'art-img-dialog'
  })
  const imgCateTreeList = ref<FileCategory[]>([])
  const visible = defineModel('visible', { type: Boolean, default: false })
  const dialogVisible = defineModel('dialogVisible', { type: Boolean, default: false })
  const cateList = ref<FileCategory[]>([])
  const handleClose = () => {
    visible.value = false
  }
  const getCategoryListData = async () => {
    const res = await getCategoryList({})
    imgCateTreeList.value = [
      { name: '全部图片', id: -1, children: [] },
      {
        name: '顶级分组',
        id: 0,
        children: res.data
      }
    ]
    cateList.value = [
      {
        name: '全部分组',
        id: 0,
        children: res.data
      }
    ]
  }
  const handleNodeClick = (data: FileCategory) => {
    console.log(data)
  }
  const handleUpload = () => {
    dialogVisible.value = true
  }
  const imgName = ref('')
  const pagination = reactive({
    total: 0,
    size: 10,
    current: 1
  })
  const onSearchValue = (val: string) => {
    console.log(val)
  }
  const checkHandle = (item: any) => {
    item.checked = !item.checked
  }
  const handleSearch = () => {}
  const imgList = ref([
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 2,
      name: '图片2',
      url: 'https://fuss10.elemecdn.com/9/bb/bbf5e0a230e2ef351436d21897b64jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    },
    {
      id: 1,
      name: '图片1',
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      checked: false
    }
  ])
  const handleSubmit = () => {}
  const handleSizeChange = (val: number) => {}
  const handleCurrentChange = (val: number) => {}
  watch(
    () => visible.value,
    (val) => {
      if (val) {
        getCategoryListData()
      }
    }
  )
</script>

<style lang="scss" scoped>
  .img-box {
    height: 600px;
    display: flex;
    &_left {
      width: 20%;
      border-right: 1px solid rgba(var(--art-gray-300-rgb), 0.6);
      flex-shrink: 0;
      box-sizing: border-box;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .left-title {
        margin-bottom: 10px;
        color: var(--el-text-color-primary);
      }
      .left-list {
        overflow-y: auto;
        flex: 1;
      }
      :deep(.el-tree-node:focus > .el-tree-node__content) {
        background-color: var(--el-color-primary);
        .el-text {
          color: var(--el-card-bg-color);
        }
      }
    }
    &_right {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      margin-left: 20px;
      :deep(.img-search) {
        width: 200px;
      }
      .right-top {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .right-list {
        flex: 1;
        width: 100%;
        height: 100%;
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        overflow: auto;
        .img-list_item {
          width: 23%;
          box-sizing: border-box;
          border: 1px solid rgba(var(--art-gray-300-rgb), 0.6);
          cursor: pointer;
          height: 35%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 10px;
          position: relative;
          :deep(.el-image) {
            margin-top: 10px;
            width: 100%;
            height: 100%;
            .image-viewer-slot {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
            }
          }
          .item-name {
            text-align: center;
            padding-bottom: 5px;
            box-sizing: border-box;
          }
        }
        .is-checked {
          position: absolute;
          top: 0;
          left: 0;
          background-color: rgba($color: #000000, $alpha: 0.4);
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 25px;
          z-index: 999;
        }
      }
      :deep(.el-pagination) {
        justify-content: flex-end;
      }
    }
  }
</style>

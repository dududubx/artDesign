<template>
  <div class="upload-file">
    <el-upload
      ref="upload"
      :show-file-list="false"
      action=""
      :auto-upload="false"
      accept="*"
      multiple
      :on-change="changeFile"
    >
      <el-button type="primary">上传文件</el-button>
    </el-upload>
    <div class="upload-file_list" v-show="fileList.length">
      <div class="upload-file_list--title"> 已选择文件({{ fileList.length }}) </div>
      <div class="list-box">
        <div class="upload-file_list--item" v-for="(item, index) in fileList" :key="index">
          <div class="upload-file_list--item__top">
            <el-icon><Document /></el-icon>
            <div class="file-box">
              <div class="file-info">
                <div class="file-name">{{ item.name }}</div>
                <div class="file-size"> ({{ formatSize(item.size) }}MB) </div>
              </div>
              <el-progress :percentage="item.progress" :show-text="false" />
              <div class="progress-text">
                <div class="progress-status">
                  {{ progressStatus(item) }}
                </div>
                <div class="progress-speed" v-if="item.currentStatus != 'ready'">
                  {{ item.progress }}%
                </div>
              </div>
            </div>
            <div class="btn-box">
              <ElButton
                text
                type="danger"
                @click="cancelFile(item.currentStatus, index)"
                v-if="item.progress != 100"
              >
                {{ btnText(item.currentStatus) }}
              </ElButton>

              <ElButton
                text
                type="danger"
                @click="cancelFile('ready', index)"
                v-if="item.currentStatus == 'cancel' && item.progress != 100"
                style="margin-left: 0"
              >
                删除
              </ElButton>
              <el-icon class="success-icon" v-if="item.progress == 100"><CircleCheck /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { UploadFiles } from 'element-plus'
  import { fetchUploadFiles } from '@/api/uploadFiles'
  import axios from 'axios'
  import { FileList } from '@/types/fileManage'

  defineOptions({
    name: 'ArtUploadFile'
  })
  const fileList = defineModel<FileList[]>('fileList', {
    default: () => []
  })

  const formatSize = (size?: number) => {
    const mb = (size ?? 0) / 1024 / 1024
    return mb.toFixed(2)
  }
  const upload = useTemplateRef('upload')
  const changeFile = (file: any, uploadFiles: UploadFiles) => {
    uploadFiles.forEach((item) => {
      const findData = fileList.value.find(
        (f) => f.raw.name === item.name && f.raw.size === item.size
      )
      if (!findData) {
        fileList.value.push({
          name: item.name,
          size: item.size as number,
          progress: 0,
          currentStatus: 'ready',
          raw: item.raw as File,
          chunks: fileSplit(item.raw as File, 10 * 1024 * 1024)
        })
      }
    })
    upload?.value?.clearFiles()
  }

  const btnText = computed(() => {
    return (status: string) => {
      switch (status) {
        case 'ready':
          return '删除'
        case 'cancel':
          return '继续'
        case 'start':
          return '取消'
      }
    }
  })

  const progressStatus = computed(() => {
    return (item: FileList) => {
      if (item.currentStatus == 'ready') return '等待上传'
      // if (item.progress == 100) return '正在合并文件分片...'
      if (item.progress == 100) return '上传完成'
      return '上传中'
    }
  })
  const fileSplit = (file: File, size: number): Blob[] => {
    const chunks: Blob[] = []
    let start = 0
    let end = size
    while (start < file.size) {
      chunks.push(file.slice(start, end))
      start = end
      end = Math.min(file.size, end + size)
    }
    return chunks
  }
  const cancelMap = ref<Record<number, axios.CancelTokenSource[]>>({})
  const submitPromise = ref<Record<number, number[]>>({})
  const uploadFile = async (chunks: Blob[], file: File, fileIndex: number) => {
    cancelMap.value[fileIndex] = []
    submitPromise.value[fileIndex] = [] as any
    const allPromise = []
    let totalUploaded = 0
    fileList.value[fileIndex].currentStatus = 'start'
    for (let i = 0; i < chunks.length; i++) {
      const formData = new FormData()
      // const chunkFile = new File([chunks[i]], `part_${i}_${file.name}`, {
      //   type: file.type,
      //   lastModified: file.lastModified
      // })
      formData.append('file', chunks[i])
      formData.append('originalName', file.name)
      formData.append('index', String(i))
      // 使用 axios.CancelToken.source() 创建可取消源
      const source = axios.CancelToken.source()
      cancelMap.value[fileIndex].push(source)
      allPromise.push(
        fetchUploadFiles(formData, source.token)
          .then((res) => {
            if (res.code == 200) {
              totalUploaded++
              fileList.value[fileIndex].progress = Math.min(
                100,
                Math.round((totalUploaded / chunks.length) * 100)
              )
              cancelMap.value[fileIndex]?.splice(i, 1)
            }
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              console.log('上传被取消', err.message)
            } else {
              // console.error('上传错误', err)
            }
            throw err
          })
      )
    }
    try {
      const result = await Promise.all(allPromise)
      // 合并分片调用后端接口（如有）
      return result
    } finally {
      // 清理 cancelMap
      delete cancelMap.value[fileIndex]
    }
  }
  // 取消某个文件的所有分片上传
  const cancelFile = (data: string, fileIndex: number) => {
    const operationType: Record<string, () => void> = {
      ready: () => {
        fileList.value.splice(fileIndex, 1)
      },
      start: () => {
        fileList.value[fileIndex].currentStatus = 'cancel'
        const sources = cancelMap.value[fileIndex] || []
        sources.forEach((s) => s.cancel('取消上传'))
        delete cancelMap.value[fileIndex]
      },
      cancel: () => {}
    }
    operationType[data]()
    // 更新 UI 状态
    // fileList.value[fileIndex].progress = 0
  }

  // 取消全部
  const cancelAll = () => {
    Object.keys(cancelMap.value).forEach((k) => {
      ;(cancelMap.value[Number(k)] || []).forEach((s) => s.cancel('用户取消所有上传'))
    })
    cancelMap.value = {}
    fileList.value.forEach((f) => (f.progress = 0))
  }

  const clearFileList = () => {
    fileList.value = []
    cancelMap.value = {}
  }
  const submitFileList = async () => {
    const allPromise = []
    for (let i = 0; i < fileList.value.length; i++) {
      allPromise.push(uploadFile(fileList.value[i].chunks, fileList.value[i].raw as File, i))
    }
    await Promise.all(allPromise)
  }
  defineExpose({ clearFileList, submitFileList })
</script>

<style lang="scss" scoped>
  @use '@styles/mixin.scss' as *;
  .upload-file {
    width: 100%;
    .upload-file_list {
      margin-top: 10px;
      @include flex(flex-start, flex-start, column, $gap: 10px);
      max-height: 300px;
      overflow: hidden;
      padding: 10px;
      box-sizing: border-box;
      border: 1px solid;
      border-color: var(--el-card-border-color);
      border-radius: var(--el-dialog-border-radius);
      background: var(--el-color-primary-custom-15);
      &--title {
        color: var(--el-text-color-primary);
        // font-size: 14px;
        font-weight: bold;
      }
      .list-box {
        height: 100%;
        width: 100%;
        overflow: auto;
      }
      .list-box::-webkit-scrollbar {
        display: none;
      }
      &--item {
        width: 100%;
        &__top {
          @include flex(flex-start, flex-start, $gap: 10px);
          box-sizing: border-box;
          padding: 10px;
          margin-bottom: 5px;
          border: 1px solid var(--el-card-border-color);
          border-radius: var(--el-dialog-border-radius);
          background: var(--el-dialog-bg-color);
          .file-box {
            flex: 1;
            @include flex(flex-start, flex-start, column, $gap: 5px);
            :deep(.el-progress) {
              width: 100%;
            }
            .progress-text {
              width: 100%;
              @include flex(center, space-between);
            }
          }
          .file-info {
            flex: 1;
            width: 100%;
            @include flex(center, flex-start);
          }
          .file-name {
            flex: 1;
            color: var(--el-text-color-primary);
          }
          :deep(.el-icon) {
            height: 25px;
            font-size: 20px;
            color: var(--el-color-primary);
          }
          :deep(.success-icon) {
            height: 33px;
            color: var(--el-color-success);
          }
          :deep(.el-button) {
            padding: 5px;
          }
        }
        &__top:hover {
          border: 1px solid var(--el-color-primary);
        }
      }
    }
  }
</style>

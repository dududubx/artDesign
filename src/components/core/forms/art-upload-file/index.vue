<template>
  <div class="upload-file">
    <el-upload
      ref="upload"
      :show-file-list="false"
      action=""
      :auto-upload="false"
      accept=".jpg,.jpeg,.png,.gif,.video,.mp4,.mov,.avi,.wmv,.mkv,.flv"
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
                @click="cancelFile(item.currentStatus, index, item)"
                v-if="item.progress != 100"
              >
                {{ btnText(item.currentStatus) }}
              </ElButton>

              <ElButton
                text
                type="danger"
                @click="cancelFile('ready', index, item)"
                v-if="['cancel', 'fail'].includes(item.currentStatus) && item.progress != 100"
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
  import { fetchUploadFiles, uploadSingleFile } from '@/api/uploadFiles'
  import axios from 'axios'
  import { FileList, chunkObj } from '@/types/fileManage'
  import { OssUploader } from '@/utils/oss'
  import { initUpload, getOssUploadConfig } from '@/api/uploadConfig'
  import { generateFileName } from '@/utils'

  defineOptions({
    name: 'ArtUploadFile'
  })
  const fileList = defineModel<FileList[]>('fileList', {
    default: () => []
  })
  const { $message } = getCurrentInstance()!.proxy as ComponentPublicInstance
  const VITE_MAX_CONCURRENT_FILE: number = import.meta.env.VITE_MAX_CONCURRENT_FILE || 10
  const VITE_MAX_CONCURRENT_CHUNK: number = import.meta.env.VITE_MAX_CONCURRENT_CHUNK || 20
  let activeUploads = 0

  const formatSize = (size?: number) => {
    const mb = (size ?? 0) / 1024 / 1024
    return mb.toFixed(2)
  }
  const upload = useTemplateRef('upload')
  const changeFile = (file: any, uploadFiles: UploadFiles) => {
    const allowedExts = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'mp4',
      'mov',
      'avi',
      'wmv',
      'mkv',
      'flv',
      'webm',
      'ogg'
    ]
    const isAllowedFile = (f: File) => {
      if (!f) return false
      const t = (f.type || '').toLowerCase()
      if (t.startsWith('image/') || t.startsWith('video/')) return true
      const name = (f.name || '').toLowerCase()
      const ext = name.split('.').pop() || ''
      return allowedExts.includes(ext)
    }
    if (!isAllowedFile(file.raw as File)) {
      const findIndex = uploadFiles.findIndex((item) => item.uid == file.uid)
      uploadFiles.splice(findIndex, 1)
      $message({
        type: 'error',
        message: `${file.name} 不是支持的图片或视频类型`
      })
      return // 跳过该文件，不加入列表
    }
    uploadFiles.forEach((item) => {
      const findData = fileList.value.find((f) => f.id == item.uid)
      if (!findData) {
        fileList.value.push({
          id: item.uid,
          name: item.name,
          size: item.size as number,
          progress: 0,
          currentStatus: 'ready',
          raw: item.raw as File,
          chunks: [],
          successNum: 0,
          successIndexArr: [],
          oss: undefined,
          limiteChunk: 0,
          fileUploadType: '',
          fileHash: generateFileName(item.raw as File)
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
          return '重试'
        case 'start':
          return '取消'
        case 'fail':
          return '重试'
      }
    }
  })

  const progressStatus = computed(() => {
    return (item: FileList) => {
      if (item.currentStatus == 'ready') return '等待上传'
      if (item.currentStatus == 'init') return '正在进行文件初始化...'
      if (item.currentStatus == 'fail') return '文件上传失败'
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
  const cancelMap = ref<Record<number, Record<number, axios.CancelTokenSource>>>({})
  // 本地上传
  const uploadFile = async (chunks: chunkObj[], file: File, fileId: number, taskId: string) => {
    cancelMap.value[fileId] = []
    const allPromise: Promise<any>[] = []
    const findData = fileList.value.find((f) => f.id == fileId) as FileList
    const spliceLength = VITE_MAX_CONCURRENT_CHUNK - (findData.limiteChunk as number)
    const filterArr = chunks.filter((item) => !findData.successIndexArr?.includes(item.index))
    const spliceArr = filterArr.splice(0, Math.min(spliceLength, filterArr.length))
    spliceArr.forEach((item) => {
      ;(findData.limiteChunk as number)++
      const i = item.index
      const chunk = item.blob
      const formData = new FormData()
      formData.append('file', chunk)
      formData.append('originalName', file.name)
      formData.append('chunk_index', String(i))
      formData.append('task_id', taskId)
      formData.append('chunk_size', String(item.size))
      // 使用 axios.CancelToken.source() 创建可取消源
      const source = axios.CancelToken.source()
      cancelMap.value[fileId][i] = source
      allPromise.push(
        fetchUploadFiles(formData, source.token)
          .then((res) => {
            if (res.code == 200) {
              ;(findData.successNum as number)++
              ;(findData.limiteChunk as number)--
              findData.progress = Math.min(
                100,
                Math.round(((findData.successNum as number) / chunks.length) * 100)
              )
              findData.successIndexArr?.push(i)
              delete cancelMap.value[fileId][i]
              if (findData.progress == 100) {
                delete cancelMap.value[fileId]
                activeUploads--
                submitFileList(categoryId.value)
              }
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
    })

    try {
      const result = await Promise.all(allPromise)
      if (allPromise.length) {
        uploadFile(chunks, file, fileId, taskId)
      }

      // 合并分片调用后端接口（如有）
      return result
    } finally {
      console.log(findData, allPromise, 'uploadFile')
      // 清理 cancelMap
      // delete cancelMap.value[fileId]
    }
  }
  // 本地单文件上传
  const localUploadSingleFile = async (data: FileList, file: File, taskId: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('task_id', taskId)
    await uploadSingleFile(formData)
      .then((res) => {
        if (res.code == 200) {
          activeUploads--
          data.progress = 100
          data.currentStatus = 'success'
          submitFileList(categoryId.value)
        }
      })
      .catch(() => {
        data.currentStatus = 'fail'
        activeUploads--
      })
  }
  // oss分片上传
  const ossUploadFile = async (OSS: OssUploader, file: FileList, chunkSize: number) => {
    await OSS.multipartUpload(file.raw as File, {
      partSize: chunkSize,
      progress: (val, speed) => {
        file.progress = val
      },
      success: (name) => {
        activeUploads--
        file.progress = 100
        submitFileList(categoryId.value)
      },
      fail: (err) => {
        file.currentStatus = 'cancel'
        activeUploads--
        submitFileList(categoryId.value)
        throw err
      }
    })
  }
  // oss直接上传文件
  const ossPutFile = async (OSS: OssUploader, file: FileList) => {
    console.log(OSS, OSS.put, 'ossPutFile')
    try {
      await OSS.put(file.raw as File)
      file.progress = 100
      activeUploads--
      submitFileList(categoryId.value)
    } catch (error) {
      file.currentStatus = 'cancel'
      activeUploads--
      submitFileList(categoryId.value)
      throw error
    }
  }
  // 取消某个文件的所有分片上传
  const cancelFile = (type: string, fileIndex: number, data: FileList) => {
    const operationType: Record<string, () => void> = {
      // 等待上传直接删除
      ready: () => {
        fileList.value.splice(fileIndex, 1)
      },
      // 取消上传
      start: () => {
        fileList.value[fileIndex].currentStatus = 'cancel'
        if (fileList.value[fileIndex].fileUploadType == 'aliyun') {
          const oss = data.oss as OssUploader
          oss.pauseUpload()
          // oss.abortUpload()
          // oss.delete()
        } else {
          const sources = cancelMap.value[data.id as number] || []
          Object.values(sources).forEach((s) =>
            s.cancel(`${fileList.value[fileIndex].name}取消上传`)
          )
          delete cancelMap.value[data.id as number]
        }
        activeUploads--
        submitFileList(categoryId.value)
        // fileList.value.splice(fileIndex, 1)
      },
      // 上传重试
      cancel: () => {
        fileList.value[fileIndex].currentStatus = 'start'
        if (fileList.value[fileIndex].fileUploadType == 'aliyun') {
          const oss = data.oss as OssUploader
          oss.resumeUpload(data.raw as File)
        } else {
          uploadFile(data.chunks, data.raw as File, data.id as number, data.apiData.task_id)
        }
      },
      fail: () => {
        uploadObj[data.fileUploadType as string][data.apiData.upload_mode as string](data)
      }
    }
    operationType[type]()
    // 更新 UI 状态
    // fileList.value[fileIndex].progress = 0
  }

  // 取消全部
  const cancelAll = () => {
    Object.keys(cancelMap.value).forEach((k) => {
      Object.values(cancelMap.value[Number(k)] || []).forEach((s) => s.cancel('用户取消所有上传'))
    })
    cancelMap.value = {}
    fileList.value.forEach((f) => (f.progress = 0))
  }

  const clearFileList = () => {
    fileList.value = []
    cancelMap.value = {}
  }
  const categoryId = ref<string>('')

  // 获取oss上传配置
  const initOSSConfig = async (item: FileList, taskId: string, callBack: any) => {
    let apiCount = 0
    const initApi = async () => {
      await getOssUploadConfig({ task_id: taskId }).then(async (res) => {
        if (apiCount > 2 && res.code === 202) {
          item.currentStatus = 'fail'
          $message({
            type: 'error',
            message: '获取凭证失败'
          })
          return
        }
        if (res.code == 202) {
          apiCount++
          setTimeout(async () => {
            await initApi()
          }, res.data.retryInterval)
          return
        }
        if (res.code === 200) {
          item.oss = new OssUploader(item.uploadPath as string, taskId, res.data.ossAuthInfo)
          if (callBack) {
            callBack()
          }
        }
      })
    }
    initApi()
  }
  // 上传模式
  const uploadObj: Record<string, Record<string, (item: FileList) => void>> = {
    aliyun: {
      CHUNKED: (item: FileList) => {
        initOSSConfig(item, item.apiData.task_id, () =>
          ossUploadFile(item.oss as OssUploader, item, item.apiData.chunk_size)
        )
      },
      SINGLE: (item: FileList) => {
        initOSSConfig(item, item.apiData.task_id, () => ossPutFile(item.oss, item))
      }
    },
    local: {
      CHUNKED: (item: FileList) => {
        item.chunks = fileSplit(item.raw as File, item.apiData.chunk_size).map((sitem, index) => {
          return {
            blob: sitem,
            size: sitem.size,
            index
          }
        })
        uploadFile(item.chunks, item.raw as File, item.id as number, item.apiData.task_id)
      },
      SINGLE: (item: FileList) => {
        localUploadSingleFile(item, item.raw, item.apiData.task_id)
      }
    }
  }
  // 提交文件列表
  const submitFileList = async (id: string) => {
    categoryId.value = id
    const availableSlots = VITE_MAX_CONCURRENT_FILE - activeUploads
    const pendingFiles = fileList.value
      .filter((f) => f.currentStatus == 'ready')
      .splice(0, availableSlots)

    pendingFiles.forEach((item) => {
      item.currentStatus = 'init'
      const params = {
        file_name: item.name,
        file_size: item.size,
        file_type: item.raw.type,
        group_id: id || '',
        file_hash: item.fileHash
      }
      initUpload(params)
        .then((res) => {
          if (res.code == 200) {
            const data = res.data
            item.fileUploadType = data.upload_type
            item.uploadPath = data.file_path || item.fileHash
            item.apiData = data
            uploadObj[data.upload_type][data.upload_mode](item)
          }
        })
        .catch(() => {
          item.currentStatus = 'cancel'
        })
    })
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
      .btn-box {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
    }
  }
</style>

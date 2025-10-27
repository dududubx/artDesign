<template>
  <div class="upload-file">
    <el-upload
      v-model:file-list="fileList"
      action=""
      :auto-upload="false"
      accept="*"
      :on-change="changeFile"
    >
      <el-button type="primary">上传文件</el-button>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
  import type { UploadUserFile } from 'element-plus'
  import { fetchUploadFiles } from '@/api/uploadFiles'
  import { ElLoading } from 'element-plus'

  defineOptions({
    name: 'ArtUploadFile'
  })
  const fileList = ref<UploadUserFile[]>([])

  const changeFile = (file: any) => {
    fileList.value.push({
      name: file.name,
      url: ''
    })
    console.log(file, 'changeFile')
    const chunks = fileSplit(file.raw, 1024 * 1024 * 5)
    uploadFile(chunks, file.name.split('.')[file.name.split('.').length - 1])
  }

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

  const uploadFile = async (chunks: Blob[], type: string) => {
    const loading = ElLoading.service({
      lock: true,
      text: '上传中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    const allPromise = []
    for (let i = 0; i < chunks.length; i++) {
      const formData = new FormData()
      formData.append('file', chunks[i])
      formData.append('index', String(i))
      formData.append('fileType', type)
      allPromise.push(fetchUploadFiles(formData))
    }
    const result = await Promise.all(allPromise)
    loading.close()
    return result
  }
</script>

<style lang="scss" scoped></style>

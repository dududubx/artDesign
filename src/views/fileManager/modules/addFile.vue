<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增文件' : '编辑文件'"
    width="50%"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="文件名称" prop="name">
        <ElInput v-model="form.name" />
      </ElFormItem>
      <ElFormItem label="上传文件" prop="file">
        <el-upload
          v-model:file-list="fileList"
          action="#"
          :multiple="true"
          :auto-upload="false"
          accept=".jpg,.jpeg,.png,.gif"
          :on-exceed="
            () =>
              $message({
                type: 'error',
                message: '最多只能上传5个文件'
              })
          "
          :on-change="changeFile"
        >
          <el-button type="primary">上传文件</el-button>
        </el-upload>
      </ElFormItem>
      <ElFormItem label="文件大小" prop="size">
        <ElInput v-model="form.size" disabled />
      </ElFormItem>
      <ElFormItem label="文件后缀" prop="suffix">
        <ElInput v-model="form.suffix" disabled />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>
<script setup lang="ts">
  import { FormInstance, FormRules, UploadFile, UploadFiles, ElLoading } from 'element-plus'
  import { fetchUploadFiles } from '@/api/uploadFiles'
  import { error } from 'console'
  const { $message } = getCurrentInstance()!.proxy as ComponentPublicInstance
  interface addFile {
    name: string
    file: UploadFiles
    size: number
    suffix: string
  }

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    editData?: {
      id: number
      filePath: string
      name: string
      way: string
      fileType: string
      size: number
      suffix: string
      createTime: string
    }
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }
  const fileList = ref<
    {
      name: string
      url: string
    }[]
  >([])
  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    editData: undefined
  })

  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    name: [{ required: true, message: '请输入文件名称', trigger: 'blur' }],
    file: [{ required: true, message: '请选择文件', trigger: 'blur' }]
  })

  let form = reactive<addFile>({
    name: '',
    file: null as unknown as UploadFiles,
    size: 0,
    suffix: ''
  })

  // 监听弹窗打开，初始化表单数据
  watch(
    () => props.modelValue,
    (newVal) => {
      console.log('弹窗状态变化', newVal)
      if (newVal) {
        initForm()
      }
    },
    { immediate: true }
  )

  // 监听角色数据变化
  watch(
    () => props.editData,
    (newData) => {
      if (newData && props.modelValue) {
        initForm()
      }
    },
    { deep: true }
  )

  const initForm = () => {
    if (props.dialogType === 'edit' && props.editData) {
      Object.assign(form, {
        name: props.editData.name,
        size: props.editData.size,
        suffix: props.editData.suffix,
        file: [
          new File([props.editData.filePath], props.editData.name, {
            type: props.editData.fileType
          })
        ]
      })
      fileList.value = [
        {
          name: props.editData.name,
          url: props.editData.filePath
        }
      ]
    } else {
      form = reactive<addFile>({
        name: '',
        file: null as unknown as UploadFiles,
        size: 0,
        suffix: ''
      })
      fileList.value = []
      console.log('初始化表单数据')
    }
  }

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      // TODO: 调用新增/编辑接口
      const message = props.dialogType === 'add' ? '新增成功' : '修改成功'
      const loading = ElLoading.service({
        lock: true,
        fullscreen: true,
        text: '上传中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const allPromise = []
      for (let i = 0; i < form.file.length; i++) {
        const formData = new FormData()
        formData.append('file', form.file[i].raw as File)
        allPromise.push(fetchUploadFiles(formData))
      }
      await Promise.all(allPromise)
      loading.close()
      $message({
        type: 'success',
        message: message
      })
      emit('success')
      handleClose()
    } catch (error) {
      $message({
        type: 'error',
        message: '表单验证失败'
      })
      console.log('表单验证失败:', error)
    }
  }
  const changeFile = (file: UploadFile, uploadFiles: UploadFiles) => {
    form.file = uploadFiles
    form.name = file.name
    form.size = file.size as number
    form.suffix = file.name.split('.').pop() as string
    fileList.value = [
      {
        name: file.name,
        url: URL.createObjectURL(file.raw as File)
      }
    ]
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>

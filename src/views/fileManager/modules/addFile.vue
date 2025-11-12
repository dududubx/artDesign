<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增文件' : '编辑文件'"
    width="50%"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
      <ElFormItem label="上传方式" prop="type">
        <ElRadioGroup v-model="form.type">
          <ElRadio :value="1" label="local">本地上传</ElRadio>
          <ElRadio :value="2" label="code">扫码上传</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="上传分组" prop="group">
        <ElRow :gutter="10" style="width: 100%">
          <ElCol :span="8">
            <ElTreeSelect
              ref="treeRef"
              v-model="form.group"
              :data="cateList"
              :render-after-expand="false"
              :check-on-click-node="true"
              :expand-on-click-node="false"
              @node-click="onTreeNodeClick"
              node-key="id"
              :props="{ label: 'name', value: 'id' }"
            >
            </ElTreeSelect>
          </ElCol>
          <ElCol :span="4">
            <ElButton type="primary" @click="handleAddGroup">新增</ElButton>
          </ElCol>
        </ElRow>
      </ElFormItem>
      <ElFormItem label="选择文件" prop="fileList" v-if="form.type == 1">
        <ArtUploadFile ref="uploadRef" v-model:file-list="form.fileList" />
      </ElFormItem>
      <ElFormItem label="二维码" prop="code" v-else>
        <div class="code-box">
          <ElImage :src="codeImg"> </ElImage>
          <div class="tips-text">扫描二维码，快速上传手机图片</div>
          <div class="other-tips">建议使用手机浏览器</div>
        </div>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton
          type="primary"
          @click="uploadFileHandle"
          :loading="loading"
          v-if="form.fileList.length > 0 && form.fileList.some((item) => item.progress != 100)"
          >{{ isClick ? '上传中' : '开始上传' }}</ElButton
        >
        <ElButton type="primary" @click="handleSubmit" v-else>提交</ElButton>
      </div>
    </template>
  </ElDialog>
  <categoryDialog
    v-model:visible="dialogVisible"
    :cartegoryData="cateList"
    :isEdit="false"
    @submit="refleshCateList"
  />
</template>
<script setup lang="ts">
  import { FormInstance, FormRules } from 'element-plus'
  import type { FileCategory } from '@/types/fileManage'
  import categoryDialog from './categoryDialog.vue'
  import { FileList } from '@/types/fileManage'

  const { $message } = getCurrentInstance()!.proxy as ComponentPublicInstance
  interface addFile {
    type: number
    fileList: FileList[]
    group: string
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
    cateList?: FileCategory[]
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
    (e: 'relfeshCateList'): void
  }

  const codeImg = new URL('@imgs/common/img_code.png', import.meta.url).href
  const dialogVisible = ref(false)
  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    editData: undefined,
    cateList: undefined
  })

  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    type: [{ required: true, message: '请选择上传方式', trigger: 'change' }],
    group: [{ required: true, message: '请选择上传分组', trigger: 'blur' }],
    fileList: [{ required: true, message: '请选择文件', trigger: 'change' }]
  })

  let form = reactive<addFile>({
    type: 1,
    fileList: [] as unknown as any[],
    group: ''
  })
  const isClick = ref(false)
  watch(
    () => form.fileList.length,
    (newVal, oldVal) => {
      console.log('文件列表变化', newVal, oldVal)
      isClick.value = false
    },
    {
      deep: true
    }
  )
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
  const uploadRef = useTemplateRef('uploadRef')
  const loading = computed(() => {
    const isLoading: boolean = (form.fileList.length &&
      form.fileList.some((item) => item.progress != 100) &&
      isClick.value) as boolean
    return isLoading
  })
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
    } else {
      // 原地重置，保持同一个 reactive 对象引用，避免打断 watcher 与模板绑定
      form.type = 1
      // 清空数组但保持引用，确保 v-model 和 watch 能正确响应
      form.fileList.length = 0
      form.group = ''
      formRef.value?.resetFields()
      isClick.value = false
      formRef.value?.resetFields()
      isClick.value = false
    }
    uploadRef.value?.clearFileList()
  }

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }
  const uploadFileHandle = async () => {
    if (!form.group && form.type === 1) {
      return $message({
        type: 'warning',
        message: '请先选择上传分组'
      })
    }
    isClick.value = true
    if (form.fileList.length) {
      await uploadRef.value?.submitFileList(form.group)
      return
    }
  }
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      // TODO: 调用新增/编辑接口
      const message = props.dialogType === 'add' ? '新增成功' : '修改成功'

      $message({
        type: 'success',
        message: message
      })
      emit('success')
      // handleClose()
    } catch (error) {
      $message({
        type: 'error',
        message: '表单验证失败'
      })
      console.log('表单验证失败:', error)
    }
  }
  const handleAddGroup = () => {
    dialogVisible.value = true
  }
  const refleshCateList = () => {
    emit('relfeshCateList')
  }
  const treeRef = templateRef<any>('treeRef')
  const onTreeNodeClick = (data: any) => {
    form.group = data.id
    // 点击父节点后尝试关闭下拉（兼容不同组件实现）
    nextTick(() => {
      const inst = treeRef.value as any
      if (!inst) {
        // 最保险的兜底：触发一次 body 点击，很多弹出组件会因此关闭
        document.body.click()
        return
      }
      if (typeof inst.hide === 'function') {
        inst.hide()
        return
      }
      if (typeof inst.close === 'function') {
        inst.close()
        return
      }
      if (typeof inst.blur === 'function') {
        inst.blur()
        return
      }
      if ('visible' in inst) {
        try {
          inst.visible = false
          return
        } catch {}
      }
      // 最后兜底
      document.body.click()
    })
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  .code-box {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    :deep(.el-image) {
      height: 200px;
      width: 200px;
    }
    .tips-text {
      color: var(--el-text-color-primary);
    }
    .other-tips {
      color: var(--el-text-color-placeholder);
      font-size: 12px;
      margin-top: -15px;
    }
  }
</style>

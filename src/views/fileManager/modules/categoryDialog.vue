<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="400px"
    align-center
    class="menu-dialog"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="85px">
      <ElFormItem label="父级分类" prop="parent_id">
        <ElTreeSelect
          ref="treeRef"
          v-model="form.parent_id"
          :data="treeData"
          :render-after-expand="false"
          :check-on-click-node="true"
          :expand-on-click-node="false"
          @node-click="onTreeNodeClick"
          node-key="id"
          :props="{ label: 'name', value: 'id' }"
        >
        </ElTreeSelect>
      </ElFormItem>
      <ElFormItem label="分类名称" prop="name">
        <ElInput v-model="form.name" placeholder="分类名称" />
      </ElFormItem>
      <ElFormItem label="分类排序" prop="sort">
        <ElInputNumber v-model.number="form.sort" controls-position="right" />
      </ElFormItem>
      <ElFormItem label="分类描述" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import type { FileCategory } from '@/types/fileManage'
  import { addCategory, editCategory } from '@/api/file-manage'

  defineOptions({ name: 'categoryDialog' })
  interface Props {
    visible: boolean
    editData?: FileCategory | any
    cartegoryData: FileCategory[]
    isEdit?: boolean
  }
  const { $message } = getCurrentInstance()!.proxy as ComponentPublicInstance
  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: FileCategory): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    lockType: false,
    isEdit: false
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  let form = reactive<FileCategory>({
    parent_id: '',
    name: '',
    sort: 1,
    remark: ''
  })
  const treeData = computed(() => {
    return [
      {
        name: '顶级分类',
        id: 0,
        children: props.cartegoryData.map((item) => {
          return {
            ...item,
            children: []
          }
        })
      }
    ]
  })
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入分类名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    sort: [{ required: true, message: '请输入分类排序', trigger: 'blur' }]
  })

  const dialogTitle = computed(() => {
    return props.isEdit ? `编辑分类` : `新建分类`
  })

  const resetForm = () => {
    formRef.value?.resetFields()
    form = reactive<FileCategory>({
      parent_id: '',
      name: '',
      sort: 1,
      remark: ''
    })
  }

  const loadFormData = () => {
    if (!props.editData) return

    const row = props.editData
    if (row.id || row.id === 0) {
      form.id = row.id
    }
    form.parent_id = row.parent_id || ''
    form.name = row.name || ''
    form.sort = row.sort || 1
    form.remark = row.remark || ''
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (props.isEdit) {
            await editCategory(form)
          } else {
            await addCategory(form)
          }
          emit('submit', form)
          $message({
            type: 'success',
            message: `${props.isEdit ? '编辑' : '新增'}成功`
          })
          handleCancel()
        } catch {
          // $message({
          //   type: 'error',
          //   message: `${props.isEdit ? '编辑' : '新增'}失败`
          // })
        }
      }
    })
  }

  const handleCancel = () => {
    emit('update:visible', false)
  }

  const handleClosed = () => {
    resetForm()
  }
  const treeRef = templateRef<any>('treeRef')
  const onTreeNodeClick = (data: any) => {
    form.parent_id = data.id
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
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (props.editData) {
            if (props.editData.parent_id && !props.editData.id) {
              form.parent_id = props.editData.parent_id
              return
            }
            loadFormData()
          }
        })
      }
    }
  )
</script>

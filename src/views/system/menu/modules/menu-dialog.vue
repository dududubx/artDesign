<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="800px"
    align-center
    class="menu-dialog"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="85px">
      <ElFormItem label="上级菜单" prop="parentId">
        <ElTreeSelect v-model="form.parentId" :data="menuData" :render-after-expand="false">
        </ElTreeSelect>
      </ElFormItem>
      <ElFormItem label="菜单类型" prop="type">
        <ElRadioGroup v-model="form.type">
          <ElRadio :value="1" label="menu">目录</ElRadio>
          <ElRadio :value="2" label="menu">菜单</ElRadio>
          <ElRadio :value="3" label="button">按钮</ElRadio>
          <ElRadio :value="4" label="link">外链</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="菜单名称" prop="name">
            <ElInput v-model="form.name" placeholder="菜单名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="路由地址" prop="path">
            <ElInput v-model="form.path" placeholder="路由地址" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="权限标识" prop="label">
            <ElInput v-model="form.label" placeholder="权限标识" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="组件路径" prop="component">
            <ElInput v-model="form.component" placeholder="组件路径" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="图标" prop="icon">
            <ArtIconSelector v-model="form.icon" :iconType="iconType" width="100%" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="角色权限" prop="roles">
            <ElInput v-model="rolesString" placeholder="角色权限，多个用逗号分隔" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="菜单排序" prop="sort">
            <ElInputNumber
              v-model="form.sort"
              style="width: 100%"
              :min="1"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="外部链接" prop="link">
            <ElInput v-model="form.link" placeholder="外部链接/内嵌地址(https://www.baidu.com)" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="文本徽章" prop="showTextBadge">
            <ElInput v-model="form.showTextBadge" placeholder="文本徽章内容" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="激活路径" prop="activePath">
            <ElInput v-model="form.activePath" placeholder="详情页激活选中的菜单路径" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="6">
          <ElFormItem label="是否启用" prop="isEnable">
            <ElSwitch v-model="form.isEnable" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="页面缓存" prop="keepAlive">
            <ElSwitch v-model="form.keepAlive" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="隐藏菜单" prop="isHide">
            <ElSwitch v-model="form.isHide" />
          </ElFormItem>
        </ElCol>
        <!-- <ElCol :span="6">
          <ElFormItem label="是否内嵌" prop="isIframe">
            <ElSwitch v-model="form.isIframe" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="显示徽章" prop="showBadge">
            <ElSwitch v-model="form.showBadge" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="固定标签" prop="fixedTab">
            <ElSwitch v-model="form.fixedTab" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="标签隐藏" prop="isHideTab">
            <ElSwitch v-model="form.isHideTab" />
          </ElFormItem>
        </ElCol> -->
      </ElRow>
      <!-- 菜单表单 -->
      <template> </template>

      <!-- 权限表单 -->
      <!-- <template v-if="menuType === 'button'">
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="权限名称" prop="authName">
              <ElInput v-model="form.authName" placeholder="权限名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="权限标识" prop="authLabel">
              <ElInput v-model="form.authLabel" placeholder="权限标识" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="权限排序" prop="authSort">
              <ElInputNumber
                v-model="form.authSort"
                style="width: 100%"
                :min="1"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </template> -->
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
  import { ElMessage } from 'element-plus'
  import { IconTypeEnum } from '@/enums/appEnum'
  import { formatMenuTitle } from '@/router/utils/utils'
  import type { AppRouteRecord } from '@/types/router'

  interface MenuFormData {
    id: number
    parentId: string
    type: number
    name: string
    path: string
    label: string
    component: string
    icon: string
    isEnable: boolean
    sort: number
    isMenu: boolean
    keepAlive: boolean
    isHide: boolean
    isHideTab: boolean
    link: string
    isIframe: boolean
    showBadge: boolean
    showTextBadge: string
    fixedTab: boolean
    activePath: string
    roles: string[]
    authName: string
    authLabel: string
    authIcon: string
    authSort: number
  }

  interface Props {
    visible: boolean
    menuData: AppRouteRecord[]
    editData?: AppRouteRecord | any
    type?: string
    lockType?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: MenuFormData): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: '2',
    lockType: false
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const isEdit = ref(false)
  const iconType = ref(IconTypeEnum.UNICODE)

  const form = reactive<MenuFormData>({
    id: 0,
    parentId: '',
    type: 2,
    name: '',
    path: '',
    label: '',
    component: '',
    icon: '',
    isEnable: true,
    sort: 1,
    isMenu: true,
    keepAlive: true,
    isHide: false,
    isHideTab: false,
    link: '',
    isIframe: false,
    showBadge: false,
    showTextBadge: '',
    fixedTab: false,
    activePath: '',
    roles: [],
    authName: '',
    authLabel: '',
    authIcon: '',
    authSort: 1
  })

  const rules = reactive<FormRules>({
    type: [
      {
        required: true,
        message: '请选择菜单类型'
      }
    ],
    name: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    label: [{ required: true, message: '输入权限标识', trigger: 'blur' }],
    component: [{ required: false, message: '请输入组件路径', trigger: 'blur' }],
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authLabel: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
  })

  const dialogTitle = computed(() => {
    return isEdit.value ? `编辑菜单` : `新建菜单`
  })
  const rolesString = computed({
    get: () => form.roles.join(','),
    set: (value: string) => {
      form.roles = value
        ? value
            .split(',')
            .map((role) => role.trim())
            .filter((role) => role)
        : []
    }
  })

  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(form, {
      id: 0,
      name: '',
      path: '',
      label: '',
      component: '',
      icon: '',
      isEnable: true,
      sort: 1,
      isMenu: true,
      keepAlive: true,
      isHide: false,
      isHideTab: false,
      link: '',
      isIframe: false,
      showBadge: false,
      showTextBadge: '',
      fixedTab: false,
      activePath: '',
      roles: [],
      authName: '',
      authLabel: '',
      authIcon: '',
      authSort: 1
    })
  }

  const loadFormData = () => {
    if (!props.editData) return

    isEdit.value = true

    const row = props.editData
    form.type = row.type || 2
    form.id = row.id || 0
    form.parentId = row.parent_id || ''
    form.name = formatMenuTitle(row.name || '')
    form.path = row.route_path || ''
    form.label = row.perms || ''
    form.component = row.component_path || ''
    form.icon = row.icon || ''
    form.sort = row.sort || 1
    form.keepAlive = row.keepalive == 1 ? true : false
    form.isHide = row.hidden == 1 ? true : false
    form.isEnable = row.status == 1 ? true : false
    form.link = row.link || ''
    form.activePath = row.activePath || ''
    form.roles = row.roles || []
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          emit('submit', { ...form })
          ElMessage.success(`${isEdit.value ? '编辑' : '新增'}成功`)
          handleCancel()
        } catch {
          ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败`)
        }
      }
    })
  }

  const handleCancel = () => {
    emit('update:visible', false)
  }

  const handleClosed = () => {
    resetForm()
    isEdit.value = false
  }

  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (props.editData) {
            loadFormData()
          }
        })
      }
    }
  )
</script>

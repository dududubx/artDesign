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
      <ElFormItem label="上级菜单" prop="parent_id">
        <ElTreeSelect
          ref="treeRef"
          v-model="form.parent_id"
          :data="menuData"
          :render-after-expand="false"
          node-key="id"
          :check-on-click-node="true"
          :expand-on-click-node="false"
          @node-click="onTreeNodeClick"
          :props="{ label: 'name', value: 'id' }"
        >
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
          <ElFormItem :label="form.type == 3 ? '按钮名称' : '菜单名称'" prop="name">
            <ElInput v-model="form.name" placeholder="菜单名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="权限标识" prop="perms">
            <ElInput v-model="form.perms" placeholder="权限标识" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12" v-if="![3].includes(form!.type as number)">
          <ElFormItem
            label="路由地址"
            prop="route_path"
            :rules="[
              {
                required: ![3, 4].includes(form!.type as number),
                message: '请输入路由地址',
                trigger: 'blur'
              }
            ]"
          >
            <ElInput v-model="form.route_path" placeholder="路由地址" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12" v-if="![3, 4].includes(form!.type as number)">
          <ElFormItem
            label="组件路径"
            prop="component_path"
            :rules="[
              {
                required: ![3, 4].includes(form!.type as number),
                message: '请输入组件路径',
                trigger: 'blur'
              }
            ]"
          >
            <ElInput v-model="form.component_path" placeholder="组件路径" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12" v-if="form.type != 3">
          <ElFormItem label="菜单图标" prop="icon">
            <ArtIconSelector v-model="form.icon" :iconType="iconType" width="100%" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="系统排序" prop="sort">
            <ElInputNumber
              v-model="form.sort"
              style="width: 100%"
              :min="1"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12" v-if="form.type != 3">
          <ElFormItem
            label="外部链接"
            prop="link"
            :rules="[{ required: form.type === 4, message: '请输入外部链接', trigger: 'blur' }]"
          >
            <ElInput v-model="form.link" placeholder="外部链接/内嵌地址(https://www.baidu.com)" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12" v-if="form.type != 3">
          <ElFormItem
            label="文本徽章"
            prop="badge_content"
            :rules="[
              { required: form.is_badge === 1, message: '请输入文本徽章内容', trigger: 'blur' }
            ]"
          >
            <ElInput v-model="form.badge_content" placeholder="文本徽章内容" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <!-- <ElCol :span="12">
          <ElFormItem label="角色权限" prop="roles">
            <ElInput v-model="rolesString" placeholder="角色权限，多个用逗号分隔" />
          </ElFormItem>
        </ElCol> -->
      </ElRow>

      <!-- <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="文本徽章" prop="badge_content">
            <ElInput v-model="form.badge_content" placeholder="文本徽章内容" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="激活路径" prop="activePath">
            <ElInput v-model="form.activePath" placeholder="详情页激活选中的菜单路径" />
          </ElFormItem>
        </ElCol>
      </ElRow> -->

      <ElRow :gutter="20">
        <ElCol :span="6">
          <ElFormItem label="是否启用" prop="status">
            <ElSwitch v-model="form.status" :active-value="1" :inactive-value="2" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6" v-if="form.type != 3">
          <ElFormItem label="页面缓存" prop="is_cache">
            <ElSwitch v-model="form.is_cache" :active-value="1" :inactive-value="2" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6" v-if="form.type != 3">
          <ElFormItem label="隐藏菜单" prop="is_hidden">
            <ElSwitch v-model="form.is_hidden" :active-value="1" :inactive-value="2" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6" v-if="form.type != 3">
          <ElFormItem label="是否内嵌" prop="is_iframe">
            <ElSwitch v-model="form.is_iframe" :active-value="1" :inactive-value="2" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6" v-if="form.type != 3">
          <ElFormItem label="显示徽章" prop="is_badge">
            <ElSwitch v-model="form.is_badge" :active-value="1" :inactive-value="2" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6" v-if="form.type != 3">
          <ElFormItem label="固定标签" prop="is_fixes_tag">
            <ElSwitch v-model="form.is_fixes_tag" :active-value="1" :inactive-value="2" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6" v-if="form.type != 3">
          <ElFormItem label="标签隐藏" prop="is_hide_tag">
            <ElSwitch v-model="form.is_hide_tag" :active-value="1" :inactive-value="2" />
          </ElFormItem>
        </ElCol>
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
  import { IconTypeEnum } from '@/enums/appEnum'
  import { formatMenuTitle } from '@/router/utils/utils'
  import { fetchAddSystemMenu, fetchEditSystemMenu } from '@/api/menu'
  import type { MenuFormData } from '@/types/menu'
  import { getMenuData } from '@/router/guards/beforeEach'

  interface Props {
    visible: boolean
    menuData: MenuFormData[]
    editData?: MenuFormData | any
    type?: string
    lockType?: boolean
    isEdit?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: MenuFormData): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: '2',
    lockType: false,
    isEdit: false
  })
  const { $message } = getCurrentInstance()!.proxy as ComponentPublicInstance
  const emit = defineEmits<Emits>()
  const treeRef = templateRef<any>('treeRef')

  const formRef = ref<FormInstance>()
  const iconType = ref(IconTypeEnum.UNICODE)
  let form = reactive<MenuFormData>({
    parent_id: '',
    type: 2,
    name: '',
    route_path: '',
    perms: '',
    component_path: '',
    icon: '',
    status: 1,
    sort: 1,
    is_cache: 2,
    is_hidden: 2,
    is_hide_tag: 2,
    link: '',
    is_iframe: 2,
    is_badge: 2,
    badge_content: '',
    is_fixes_tag: 2
  })

  const rules = reactive<FormRules>({
    type: [
      {
        required: true,
        message: '请选择菜单类型',
        trigger: 'change'
      }
    ],
    parent_id: [{ required: true, message: '请选择上级菜单', trigger: 'change' }],
    name: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    perms: [{ required: true, message: '输入权限标识', trigger: 'blur' }],
    sort: [{ required: true, message: '请输入菜单排序', trigger: 'change' }]
  })
  const dialogTitle = computed(() => {
    return props.isEdit ? `编辑菜单` : `新建菜单`
  })

  const resetForm = () => {
    formRef.value?.resetFields()
    Object.assign(form, {
      name: '',
      route_path: '',
      perms: '',
      component_path: '',
      icon: '',
      status: 1,
      sort: 1,
      is_cache: 2,
      is_hidden: 2,
      is_hide_tag: 2,
      link: '',
      is_iframe: 2,
      is_badge: 2,
      badge_content: '',
      is_fixes_tag: 2
    })
  }

  const loadFormData = () => {
    if (!props.editData) return

    const row = props.editData
    form.type = row.type || 2
    if (row.id || row.id === 0) {
      form.id = row.id
    }
    form.parent_id = row.parent_id || 0
    form.name = formatMenuTitle(row.name || '')
    form.route_path = row.route_path || ''
    form.perms = row.perms || ''
    form.component_path = row.component_path || ''
    form.icon = row.icon || ''
    form.sort = row.sort || 1
    form.is_cache = row.is_cache || 2
    form.is_hidden = row.is_hidden || 2
    form.is_hide_tag = row.is_hide_tag || 2
    form.is_iframe = row.is_iframe || 2
    form.is_badge = row.is_badge || 2
    form.badge_content = row.badge_content || ''
    form.is_fixes_tag = row.is_fixes_tag || 2
    form.status = row.status || 1
    form.link = row.link || ''
  }
  const router = useRouter()
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (props.isEdit) {
            await fetchEditSystemMenu({ ...form })
          } else {
            await fetchAddSystemMenu({ ...form })
          }
          $message({
            type: 'success',
            message: `${props.isEdit ? '编辑' : '新增'}成功`
          })
          emit('submit', { ...form })
          await getMenuData(router)
          handleCancel()
        } catch {
          $message({
            type: 'error',
            message: `${props.isEdit ? '编辑' : '新增'}失败`
          })
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
          loadFormData()
        })
      }
    }
  )
</script>

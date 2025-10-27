<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    :is-expand="false"
    :span="3.4"
    :show-expand="true"
    :show-reset-button="true"
    :show-search-button="true"
    :disabled-search-button="false"
    :buttonLeftLimit="10"
    @reset="handleReset"
    @search="handleSearch"
  >
    <!-- <template #email>
      <ElInput v-model="formData.email" placeholder="我是插槽渲染出来的组件" />
    </template> -->
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, h } from 'vue'
  import ArtIconSelector from '@/components/core/base/art-icon-selector/index.vue'
  import { IconTypeEnum } from '@/enums/appEnum'

  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {
    // name: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
  }

  // 动态 options
  const levelOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])

  // 模拟接口返回用户等级
  function fetchLevelOptions(): Promise<typeof levelOptions.value> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: '普通用户', value: 'normal' },
          { label: 'VIP用户', value: 'vip' },
          { label: '高级VIP', value: 'svip' },
          { label: '企业用户', value: 'enterprise', disabled: true }
        ])
      }, 1000)
    })
  }

  onMounted(async () => {
    levelOptions.value = await fetchLevelOptions()
  })

  // 表单配置
  const formItems = computed(() => [
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '',
        options: [
          {
            label: '启用',
            value: 1
          },
          {
            label: '离线',
            value: 2
          },
          {
            label: '异常',
            value: 3
          },
          {
            label: '禁用',
            value: 4
          }
        ]
      }
    },
    { label: '昵称', key: 'nickname', type: 'input', placeholder: '' },
    {
      label: '手机号',
      key: 'phone',
      type: 'input',
      props: { placeholder: '', maxlength: '11' }
    },
    {
      label: '真实姓名',
      key: 'real_name',
      type: 'input',
      placeholder: '',
      clearable: true
    }
  ])

  // 事件
  function handleReset() {
    console.log('重置表单')
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
    console.log('表单数据', formData.value)
  }
</script>

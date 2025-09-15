<template>
  <div class="art-tabs" id="art-table-tabs">
    <el-tabs v-model="activeName" @tab-click="handleClick" v-bind="$attrs">
      <el-tab-pane v-for="pane in panes" :key="pane.name" :label="pane.label" :name="pane.name">
        <slot v-if="pane.useSlot" :name="pane.slotName || pane.name"></slot>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
  import type { TabsPaneContext } from 'element-plus'
  import type { TabsConfig } from '@/types/component'
  defineOptions({ name: 'ArtTabs' })

  interface Props {
    /** 斑马纹 */
    panes: TabsConfig[]
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = withDefaults(defineProps<Props>(), {
    panes: () => []
  })

  const emit = defineEmits<{
    (e: 'tabClick', tab: TabsPaneContext, event: Event): void
  }>()
  const activeName = defineModel('activeName', {
    type: String,
    default: ''
  })

  const handleClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
    emit('tabClick', tab, event)
  }
</script>

<style lang="scss" scoped></style>

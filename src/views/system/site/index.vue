<template>
  <div class="user-page art-full-height">
    <ElCard class="art-table-card" shadow="never" style="margin-top: 0">
      <ArtTabs :panes="tabs" v-model:active-name="activeName" />
      <orderConfig v-if="activeName == 'allOrder'" />
      <uploadConfig v-if="activeName == 'waitPayOrder'" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import type { TabsConfig } from '@/types/component'
  import orderConfig from './components/orderConfig.vue'
  import uploadConfig from './components/uploadConfig.vue'
  //tabs
  const tabs = ref<TabsConfig[]>([
    {
      name: 'allOrder',
      label: '基本配置'
    },
    {
      name: 'waitPayOrder',
      label: '上传配置'
    },
    {
      name: 'waitSendOrder',
      label: '登录注册'
    },
    {
      name: 'waitReceiveOrder',
      label: '商品配置'
    },
    {
      name: 'receiveOrder',
      label: '订单配置'
    },
    {
      name: 'sentOrder',
      label: '系统商户'
    },
    {
      name: 'notReturnOrder',
      label: '游客管理'
    },
    {
      name: 'returnOrder',
      label: '分享配置'
    },
    {
      name: 'succeedOrder',
      label: '接口配置'
    }
  ])
  const activeName = ref('allOrder')
</script>

<style lang="scss" scoped>
  ::-webkit-scrollbar-track {
    background-color: var(--el-fill-color-blank);
  }
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    padding-top: 5px;
  }
  :deep(.input-wrap) {
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    gap: 5px;
    .input-label {
      flex: 1;
      width: 100%;
      height: 100%;
      line-height: 40px;
      padding: 1px 11px;
      color: var(--art-text-gray-500);
      background: repeating-linear-gradient(
        135deg,
        #ffffff,
        transparent,
        var(--art-text-gray-300) 6px
      );
    }
    .copy-icon {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  }
  :deep(.el-upload-list--picture-card) {
    --el-upload-list-picture-card-size: 95px;
    .el-upload--picture-card {
      --el-upload-picture-card-size: 95px;
    }
  }
  :deep(.hidden-upload) {
    .el-upload--picture-card {
      display: none;
    }
  }
  :deep(.el-dialog) {
    --el-dialog-margin-top: 5vh;
  }
  :deep(.el-form) {
    --el-text-color-regular: var(--el-text-color-primary);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: scroll;
    .el-form-item__content {
      gap: 10px;
      .el-row {
        width: 100%;
      }
    }
    .bottom-btn {
      height: 100%;
      flex: 1;
      .el-form-item__content {
        justify-content: center;
      }
    }
    .tips-text {
      color: var(--main-color);
    }
  }
</style>

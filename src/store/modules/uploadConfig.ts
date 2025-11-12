import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUploadConfigStore = defineStore(
  'uploadConfig',
  () => {
    // 上传配置项
    const uploadConfig = ref()

    const setUploadConfig = (config: any) => {
      uploadConfig.value = config
    }

    return {
      uploadConfig,
      setUploadConfig
    }
  },
  {
    persist: {
      key: 'uploadConfig',
      storage: localStorage
    }
  }
)

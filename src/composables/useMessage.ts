import { getCurrentInstance, ComponentPublicInstance } from 'vue'

export function useMessage() {
  const { $message } = getCurrentInstance()!.proxy as ComponentPublicInstance

  return {
    $message
  }
}

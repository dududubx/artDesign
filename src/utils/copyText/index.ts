import { ElMessage } from 'element-plus'
export const copyText = async (text: string) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('复制成功')
    } catch (err) {
      console.error('复制失败', err)
    }
  } else {
    const input = document.createElement('input')
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    ElMessage.success('复制成功')
  }
}

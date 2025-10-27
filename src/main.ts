import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store'                 // Store
import { initRouter } from './router'               // Router
import '@styles/reset.scss'                         // 重置HTML样式
import '@styles/app.scss'                           // 全局样式
import '@styles/el-ui.scss'                         // 优化element样式
import '@styles/mobile.scss'                        // 移动端样式优化
import '@styles/change.scss'                        // 主题切换过渡优化
import '@styles/theme-animation.scss'               // 主题切换动画
import '@styles/el-light.scss'                      // Element 自定义主题（亮色）
import '@styles/el-dark.scss'                       // Element 自定义主题（暗色）
import '@styles/dark.scss'                          // 系统主题
import '@icons/system/iconfont.js'                  // 系统彩色图标
import '@icons/system/iconfont.css'                 // 系统图标
import '@utils/sys/console.ts'                      // 控制台输出内容
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'
import language from './locales'
import { ElMessage as _ElMessage } from 'element-plus'
import type { MessageFn } from 'element-plus'


document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

const app = createApp(App)
initStore(app)
initRouter(app)
setupGlobDirectives(app)
setupErrorHandle(app)

app.use(language)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局 message 包装器：统一默认 duration
const defaultMessageDuration = 2000
const wrapMessage = (options: Parameters<typeof _ElMessage>[0]) => {
  const opts =
    typeof options === 'string'
      ? { message: options }
      : (options as Record<any, any>)
  return _ElMessage({
    duration: defaultMessageDuration,
    ...opts
  })
}

// 保留 ElMessage 的静态方法（如 closeAll 等），以便被调用
const _ElMessageAny = _ElMessage as any
Object.keys(_ElMessageAny).forEach((k: string) => {
  (wrapMessage as any)[k] = _ElMessageAny[k]
})

// 挂载到全局属性，组件中 this.$message 可用
app.config.globalProperties.$message = wrapMessage as unknown as typeof _ElMessage

// 兼容在普通 TS 模块中快速调用
// eslint-disable-next-line no-undef
;(window as any).$message = wrapMessage
app.mount('#app')

declare module 'vue' {
  interface ComponentCustomProperties {
    // 支持字符串和 ElMessage 的完整签名
    $message: MessageFn
  }
}

declare global {
  interface Window {
    $message: MessageFn
  }
}


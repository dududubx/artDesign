import type { App, Directive, DirectiveBinding } from 'vue'
type DebounceBinding =
  | ((...args: any[]) => any)
  | {
      handler: (...args: any[]) => any
      wait?: number
      event?: string
      immediate?: boolean
    }

interface DebounceRecord {
  listener: EventListener
  cancel: () => void
}

declare global {
  interface HTMLElement {
    __debounce_record__?: DebounceRecord
  }
}

function createDebouncedFn(fn: (...args: any[]) => any, wait = 300, immediate = false) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let called = false

  const debounced = function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    if (immediate && !called) {
      called = true
      fn.apply(this, args)
      timer = setTimeout(() => {
        called = false
        timer = null
      }, wait)
      return
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, wait)
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    called = false
  }

  return debounced as typeof debounced & { cancel: () => void }
}

const DebounceDirective: Directive<HTMLElement, DebounceBinding> = {
  mounted(el, binding) {
    const setup = (bd: DirectiveBinding<DebounceBinding>) => {
      // 清理旧的
      if (el.__debounce_record__) {
        el.__debounce_record__.cancel()
        el.removeEventListener((bd.arg as string) || 'click', el.__debounce_record__.listener)
        delete el.__debounce_record__
      }

      let handler: ((...args: any[]) => any) | undefined
      let wait = 300
      let event = (bd.arg as string) || 'click'
      let immediate = false

      if (typeof bd.value === 'function') {
        handler = bd.value
      } else if (bd.value && typeof bd.value === 'object') {
        handler = (bd.value as any).handler
        if ((bd.value as any).wait != null) wait = Number((bd.value as any).wait) || 0
        if ((bd.value as any).event) event = (bd.value as any).event
        if ((bd.value as any).immediate) immediate = Boolean((bd.value as any).immediate)
      }

      if (!handler || typeof handler !== 'function') {
        // nothing to bind
        // eslint-disable-next-line no-console
        console.warn('[v-debounce] binding value must be a function or { handler } object')
        return
      }

      const debounced = createDebouncedFn(handler, wait, immediate)

      const listener: EventListener = (e: Event) => {
        // preserve original this/context
        ;(debounced as any).call(this, e)
      }

      el.addEventListener(event, listener)

      el.__debounce_record__ = {
        listener,
        cancel: () => {
          if (typeof (debounced as any).cancel === 'function') {
            ;(debounced as any).cancel()
          }
        }
      }
    }

    setup(binding)
  },

  updated(el, binding) {
    // 如果 handler/wait/event 变化，重新绑定
    // 简单策略：重新 setup（mounted 已有清理）
    if (el.__debounce_record__) {
      el.__debounce_record__.cancel()
      // we don't know previous event reliably; remove all possible (arg or click)
      // safer: remove listener using stored listener and assumed event (stored by mounted)
      // but we stored listener only; remove by trying common events:
      // best-effort: remove using current arg and 'click'
      const prevEvent = (binding.arg as string) || 'click'
      try {
        el.removeEventListener(prevEvent, el.__debounce_record__.listener)
      } catch {}
    }
    // re-run mounted logic to rebind with new config
    ;(DebounceDirective as any).mounted?.(el, binding)
  },

  beforeUnmount(el) {
    if (el.__debounce_record__) {
      el.__debounce_record__.cancel()
      // try remove listener (best-effort)
      try {
        // listener was attached to event stored in listener closure; attempt common removal
        el.removeEventListener('click', el.__debounce_record__.listener)
      } catch {}
      delete el.__debounce_record__
    }
  }
}

export function setupDebounceDirective(app: App) {
  app.directive('debounce', DebounceDirective)
}

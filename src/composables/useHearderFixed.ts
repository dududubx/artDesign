import { nextTick, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useHearderFixed() {
  const { width } = useWindowSize()
  watch(
    () => width.value,
    () => {
      const { cardDom, cardRect, cardPadding, tableRect, tableHeader } = getDomInfo()
      if (cardDom.scrollTop + cardRect.top >= tableRect.top) {
        tableHeader.style.width = `${cardDom.clientWidth}px`
        tableHeader.style.padding = `${cardPadding.paddingTop} ${cardPadding.paddingLeft} 0`
        tableHeader.style.top = `${cardRect.top}px`
        tableHeader.style.left = `${cardRect.left}px`
      }
    }
  )
  const getDomInfo = () => {
    const cardDom = document.querySelector('.el-card__body') as HTMLElement
    const cardRect = cardDom.getBoundingClientRect()
    const cardPadding = getComputedStyle(cardDom)
    const tableDom = document.querySelector('.el-table__body-wrapper') as HTMLElement
    const tableRect = tableDom.getBoundingClientRect()
    const tableHeader = document.querySelector('.el-table__header-wrapper') as HTMLDivElement
    return { cardDom, cardRect, cardPadding, tableDom, tableRect, tableHeader }
  }
  const cardScroll = () => {
    nextTick(() => {
      const { cardDom } = getDomInfo()
      cardDom.addEventListener('scroll', () => {
        const { cardDom, cardRect, cardPadding, tableRect, tableHeader } = getDomInfo()
        if (cardDom.scrollTop + cardRect.top >= tableRect.top) {
          tableHeader.style.position = 'fixed'
          tableHeader.style.top = `${cardRect.top}px`
          tableHeader.style.left = `${cardRect.left}px`
          tableHeader.style.zIndex = '3'
          tableHeader.style.padding = `${cardPadding.paddingTop} ${cardPadding.paddingLeft} 0`
          tableHeader.style.width = `${cardDom.clientWidth}px`
          tableHeader.style.background = 'var(--el-card-bg-color)'
          tableHeader.style.boxSizing = 'border-box'
        } else {
          tableHeader.style.position = 'relative'
          tableHeader.style.top = '0'
          tableHeader.style.left = '0'
          tableHeader.style.zIndex = '1'
          tableHeader.style.padding = '0'
          tableHeader.style.width = '100%'
          tableHeader.style.background = 'none'
        }
      })
    })
  }

  return { cardScroll }
}

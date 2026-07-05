import { onBeforeUnmount } from 'vue'

const draggingClass = 'is-dragging'

function clearTextSelection() {
  if (typeof window === 'undefined')
    return

  window.getSelection()?.removeAllRanges()
}

function setDraggingClass(enabled: boolean) {
  if (typeof document === 'undefined')
    return

  document.body.classList.toggle(draggingClass, enabled)
}

export function useDragSelectionGuard() {
  function startDrag() {
    clearTextSelection()
    setDraggingClass(true)
  }

  function endDrag() {
    clearTextSelection()
    setDraggingClass(false)
  }

  onBeforeUnmount(() => setDraggingClass(false))

  return {
    clearTextSelection,
    endDrag,
    startDrag,
  }
}

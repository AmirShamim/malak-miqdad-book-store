import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus within a container while `active` is true.
 * Returns a ref to attach to the container element.
 */
export function useFocusTrap(active) {
  const ref = useRef(null)

  useEffect(() => {
    if (!active || !ref.current) return

    const container = ref.current
    const focusableEls = container.querySelectorAll(FOCUSABLE)
    const first = focusableEls[0]
    const last = focusableEls[focusableEls.length - 1]

    // Focus first element on open
    first?.focus()

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return

      if (focusableEls.length === 0) {
        e.preventDefault()
        return
      }

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return ref
}

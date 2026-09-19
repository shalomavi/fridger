import { useEffect, useState } from 'react'
import { ArrowUpIcon } from './FormIcons'
import { fieldClass } from './Input'

const SHOW_AFTER_PX = 400

/** Floating button that appears once the page is scrolled down past
 * SHOW_AFTER_PX, and jumps back to the top on tap. Listens on window since
 * the app has no inner scroll container (Layout is just min-h-dvh).
 * Reuses fieldClass so it reads as the same "glass" surface as the inputs
 * rather than a solid FAB. */
export function ScrollToTopButton({ label }: { label: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={label}
      className={`fixed bottom-6 left-1/2 z-30 flex h-11 w-11 -translate-x-1/2 items-center justify-center transition-transform duration-300 active:scale-95 ${fieldClass}`}
    >
      <ArrowUpIcon />
    </button>
  )
}

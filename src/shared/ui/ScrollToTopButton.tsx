import { useEffect, useState } from 'react'
import { ArrowUpIcon } from './FormIcons'
import { buttonShadow } from './elevation'

const SHOW_AFTER_PX = 400

/** Floating button that appears once the page is scrolled down past
 * SHOW_AFTER_PX, and jumps back to the top on tap. Listens on window since
 * the app has no inner scroll container (Layout is just min-h-dvh).
 * Same translucent/blurred "glass" surface as the inputs (bg-surface/5 +
 * backdrop-blur-sm + backdrop-saturate-150), not fieldClass itself since
 * that bakes in the inputs' rounded-lg field shape rather than a circle. */
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
      className={`fixed bottom-6 end-6 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-surface/5 text-text backdrop-blur-sm backdrop-saturate-150 transition-transform duration-300 active:scale-95 ${buttonShadow}`}
    >
      <ArrowUpIcon />
    </button>
  )
}

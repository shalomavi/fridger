import { useEffect, useState } from 'react'
import { ArrowUpIcon } from './FormIcons'
import { buttonShadow } from './elevation'

const SHOW_AFTER_PX = 400

/** Floating button that appears once the page is scrolled down past
 * SHOW_AFTER_PX, and jumps back to the top on tap. Listens on window since
 * the app has no inner scroll container (Layout is just min-h-dvh).
 * Primary-tinted glass: bg-primary at low opacity plus backdrop-blur/
 * saturate so it still reads as translucent rather than a flat fill. */
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
      className={`fixed bottom-6 left-1/2 z-30 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-primary/15 text-white backdrop-blur-[1px] backdrop-saturate-150 transition-transform duration-300 active:scale-95 ${buttonShadow}`}
    >
      <ArrowUpIcon />
    </button>
  )
}

import { useEffect, useRef, useState } from 'react'

/**
 * Detects whether a `position: sticky` element is currently pinned
 * ("stuck") vs. sitting in normal flow — CSS alone can't express this, so
 * this uses the standard sentinel + IntersectionObserver technique: a 1px
 * marker placed immediately before the sticky element stops intersecting
 * the viewport at exactly the moment the sticky element pins to `top: 0`.
 *
 * Returns a ref for that sentinel (render it as the sticky element's
 * immediately preceding sibling) and the current stuck state.
 */
export function useStuck<T extends HTMLElement>() {
  const sentinelRef = useRef<T>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { sentinelRef, stuck }
}

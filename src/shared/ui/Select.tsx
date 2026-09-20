import { useEffect, useRef, useState, type ComponentType } from 'react'
import { ChevronDownIcon } from '@/shared/ui/FormIcons'
import { fieldClass } from '@/shared/ui/Input'

export interface SelectOption {
  value: string
  label: string
}

/** Custom listbox standing in for a native <select>: browsers draw a native
 * select's open option list themselves (Chromium/WebKit ignore CSS hover
 * colors on <option>), so matching the app's primary-color hover state needs
 * our own popup instead. Single-select, string values only — matches every
 * current call site (category pickers). */
export function Select({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  leadingIcon: LeadingIcon,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder: string
  ariaLabel: string
  leadingIcon?: ComponentType<{ className?: string }>
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedIndex = options.findIndex((o) => o.value === value)
  const selectedLabel = selectedIndex >= 0 ? options[selectedIndex].label : placeholder

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function openAt(index: number) {
    setHighlighted(Math.max(0, index))
    setOpen(true)
  }

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openAt(selectedIndex)
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onChange(options[highlighted].value)
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openAt(selectedIndex))}
        onKeyDown={onButtonKeyDown}
        className={`${fieldClass} w-full min-w-0 truncate py-3 ps-8 pe-8 text-start ${
          selectedIndex >= 0 ? '' : 'text-text-subtle'
        }`}
      >
        {selectedLabel}
      </button>
      {LeadingIcon && (
        <LeadingIcon className="pointer-events-none absolute inset-y-0 inset-s-2.5 my-auto text-text-subtle" />
      )}
      <ChevronDownIcon className="pointer-events-none absolute inset-y-0 inset-e-2.5 my-auto h-3.5 w-3.5 text-text-subtle" />
      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          ref={(el) => el?.focus()}
          className="absolute inset-s-0 top-full z-20 mt-1 max-h-60 w-full min-w-max overflow-auto rounded-lg bg-surface py-1 shadow-lg ring-1 ring-inset ring-surface-muted/60"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={`cursor-pointer truncate px-3 py-2 ${
                i === highlighted ? 'bg-primary text-white' : 'text-text'
              }`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { useState, type FormEvent } from 'react'

/** One text input, free text, enter, done — no unit picker, no required fields. */
export function AddItemInput({ onAdd }: { onAdd: (name: string) => void }) {
  const [value, setValue] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const name = value.trim()
    if (!name) return
    onAdd(name)
    setValue('')
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add an item…"
        autoComplete="off"
        className="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-lg bg-teal-600 px-5 font-medium text-white disabled:opacity-50"
      >
        Add
      </button>
    </form>
  )
}

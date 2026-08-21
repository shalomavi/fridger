import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/features/household/useLanguage'

/** Name is required; amount is one free-text field, optional, no unit picker. */
export function AddItemInput({ onAdd }: { onAdd: (name: string, amount?: string) => void }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onAdd(trimmedName, amount.trim() || undefined)
    setName('')
    setAmount('')
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('addItemPlaceholder')}
        autoComplete="off"
        className="min-w-0 flex-1 rounded-lg bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={t('amountPlaceholder')}
        autoComplete="off"
        className="w-24 min-w-0 rounded-lg bg-slate-800 px-3 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="rounded-lg bg-teal-600 px-5 font-medium text-white disabled:opacity-50"
      >
        {t('add')}
      </button>
    </form>
  )
}

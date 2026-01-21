import { useEffect } from 'react'

export default function ConfirmModal({ open, title = 'Confirm', message, confirmLabel = 'Remove', cancelLabel = 'Cancel', onConfirm, onCancel }){
  useEffect(() => {
    function onKey(e){
      if(!open) return
      if(e.key === 'Escape') onCancel()
      if(e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onConfirm, onCancel])

  if(!open) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="bg-white dark:bg-slate-900 rounded-lg p-6 z-[99] w-full max-w-md shadow-lg">
        <h3 id="confirm-title" className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">{title}</h3>
        {message && <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">{message}</p>}
        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel} className="btn-outline">{cancelLabel}</button>
          <button onClick={onConfirm} className="btn-delete">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
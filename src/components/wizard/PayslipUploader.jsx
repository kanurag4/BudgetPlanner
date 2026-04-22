import { useState, useRef } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { parsePayslip } from '../../engine/payslipParser'

const ACCEPTED = '.pdf,.xlsx,.xls,.csv'
const ACCEPTED_TYPES = ['application/pdf', 'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel']

export function PayslipUploader({ onResult }) {
  const [dragging, setDragging]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const inputRef                  = useRef(null)

  async function processFile(file) {
    if (!file) return

    const ext = file.name.split('.').pop().toLowerCase()
    const validExt = ['pdf', 'xlsx', 'xls', 'csv'].includes(ext)
    if (!validExt) {
      setError('Please upload a PDF, Excel, or CSV file.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const result = await parsePayslip(file)
      onResult(result)
    } catch {
      setError('Could not read the file. Try a different format.')
    } finally {
      setLoading(false)
    }
  }

  function handleFiles(files) {
    if (files?.length) processFile(files[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false)
  }

  function handleInputChange(e) {
    handleFiles(e.target.files)
    // Reset input so the same file can be re-uploaded
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => !loading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={loading}
        aria-label="Upload payslip file"
        className={[
          'w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
          'px-4 py-6 text-sm transition-colors duration-150 focus:outline-none',
          'focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
          dragging
            ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50',
          loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        {loading ? (
          <>
            <Loader2 size={24} className="text-sky-500 animate-spin" />
            <span className="text-slate-500 dark:text-slate-400">Reading file…</span>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700">
              {dragging
                ? <FileText size={20} className="text-sky-500" />
                : <Upload size={20} className="text-slate-400" />
              }
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {dragging ? 'Drop to upload' : 'Upload payslip'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              PDF, Excel or CSV · drag & drop or click
            </span>
          </>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Error */}
      {error && (
        <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 px-1">
          {error}
        </p>
      )}

      {/* Privacy note */}
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        🔒 Nothing leaves your browser — processed entirely on-device
      </p>
    </div>
  )
}

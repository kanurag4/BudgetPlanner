import { useState } from 'react'

export function Tooltip({ content, children, position = 'top' }) {
  const [visible, setVisible] = useState(false)

  const positionClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <span className="relative inline-flex items-center">
      {/* Trigger — works on both hover and tap */}
      <span
        className="inline-flex cursor-help"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        tabIndex={0}
        role="button"
        aria-describedby="tooltip-content"
      >
        {children}
      </span>

      {/* Tooltip bubble */}
      {visible && (
        <span
          id="tooltip-content"
          role="tooltip"
          className={[
            'absolute z-50 w-56 rounded-xl bg-slate-800 dark:bg-slate-700 text-slate-100',
            'text-xs px-3 py-2 shadow-lg pointer-events-none',
            positionClasses[position] ?? positionClasses.top,
          ].join(' ')}
        >
          {content}
        </span>
      )}
    </span>
  )
}

/** Convenience: info icon with tooltip */
export function InfoTooltip({ content, position }) {
  return (
    <Tooltip content={content} position={position}>
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 text-[10px] font-bold leading-none">
        ?
      </span>
    </Tooltip>
  )
}

// Lightbox.jsx — Full-screen image overlay

import { useEffect } from 'react'

export function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/88 z-[9999] flex items-center justify-center cursor-zoom-out"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-5 text-white text-4xl font-light opacity-80 hover:opacity-100 leading-none bg-none border-none cursor-pointer">
        ×
      </button>
      <img src={src} alt="Full size"
        className="max-w-[92vw] max-h-[90vh] object-contain rounded shadow-2xl cursor-default"
        onClick={e => e.stopPropagation()} />
    </div>
  )
}

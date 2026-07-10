// Lightbox.jsx — Full-screen image gallery overlay with prev/next navigation

import { useState, useEffect, useCallback } from 'react'

export function Lightbox({ images, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const current = images[index]
  const hasMultiple = images.length > 1

  const prev = useCallback(() => setIndex(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIndex(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    function handler(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center overflow-y-auto cursor-zoom-out"
      onClick={onClose}>
      <button onClick={onClose}
        className="fixed top-4 right-5 text-white text-4xl font-light opacity-80 hover:opacity-100 leading-none bg-none border-none cursor-pointer z-10">
        ×
      </button>

      {hasMultiple && (
        <button onClick={e => { e.stopPropagation(); prev() }}
          className="fixed left-4 top-1/2 -translate-y-1/2 text-white text-5xl font-light opacity-70 hover:opacity-100 z-10 cursor-pointer select-none">
          ‹
        </button>
      )}

      <div className="flex flex-col w-full max-w-[800px] my-8 bg-white rounded shadow-2xl cursor-default overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <img src={current.src} alt={`Image ${index + 1}`}
          className="max-w-full max-h-[75vh] object-contain block" />
        {current.text && (
          <div className="px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed border-t border-gray-100">
            {current.text}
          </div>
        )}
        {hasMultiple && (
          <div className="flex gap-2 px-3 py-2 border-t border-gray-100 overflow-x-auto bg-gray-50">
            {images.map((img, i) => (
              <div key={i} onClick={() => setIndex(i)}
                className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 cursor-pointer transition-colors ${
                  i === index ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'
                }`}>
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {hasMultiple && (
        <button onClick={e => { e.stopPropagation(); next() }}
          className="fixed right-4 top-1/2 -translate-y-1/2 text-white text-5xl font-light opacity-70 hover:opacity-100 z-10 cursor-pointer select-none">
          ›
        </button>
      )}
    </div>
  )
}

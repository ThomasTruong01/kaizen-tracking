// ImagePasteZone.jsx — Paste/drag-drop image zone with thumbnails and lightbox

import { useState, useCallback } from 'react'
import { Lightbox } from './Lightbox'

export function ImagePasteZone({ images = [], onChange, disabled = false, label = '📎 Paste or drag-drop image / screenshot' }) {
  const [dragOver,    setDragOver]    = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState(null)

  function addFromFile(file) {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => onChange([...images, e.target.result])
    reader.readAsDataURL(file)
  }

  const handlePaste = useCallback(e => {
    if (disabled) return
    for (const item of (e.clipboardData?.items || [])) {
      if (item.type.startsWith('image/')) addFromFile(item.getAsFile())
    }
  }, [disabled, images, onChange])

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false)
    if (disabled) return
    for (const file of e.dataTransfer.files) addFromFile(file)
  }, [disabled, images, onChange])

  function removeImage(i) { onChange(images.filter((_, idx) => idx !== i)) }

  return (
    <div>
      {!disabled && (
        <div tabIndex={0} onPaste={handlePaste}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded px-4 py-3 text-center text-xs text-gray-400 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400
            ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'}`}>
          {label}
        </div>
      )}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {images.map((src, i) => (
            <div key={i} className="relative w-20 h-14 border border-gray-200 rounded overflow-hidden group">
              <img src={src} alt={`img ${i + 1}`}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setLightboxSrc(src)} />
              {!disabled && (
                <button onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-xs font-bold flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  )
}

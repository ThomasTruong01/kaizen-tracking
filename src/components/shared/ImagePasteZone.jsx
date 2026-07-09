// ImagePasteZone.jsx — Image gallery with per-image captions and paste/drag-drop upload

import { useState, useCallback } from 'react'
import { Lightbox } from './Lightbox'

// Normalize old string-array format to { src, caption } objects
function normalize(images) {
  return (images || []).map(img => typeof img === 'string' ? { src: img, caption: '' } : img)
}

export function ImagePasteZone({ images = [], onChange, disabled = false, label = '📎 Paste or drag-drop image / screenshot' }) {
  const [dragOver,    setDragOver]    = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState(null)

  const imgs = normalize(images)

  function addFile(file) {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => onChange([...imgs, { src: e.target.result, caption: '' }])
    reader.readAsDataURL(file)
  }

  const handlePaste = useCallback(e => {
    if (disabled) return
    for (const item of (e.clipboardData?.items || [])) {
      if (item.type.startsWith('image/')) addFile(item.getAsFile())
    }
  }, [disabled, imgs, onChange])

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragOver(false)
    if (disabled) return
    for (const file of e.dataTransfer.files) addFile(file)
  }, [disabled, imgs, onChange])

  function updateCaption(i, caption) {
    onChange(imgs.map((img, idx) => idx === i ? { ...img, caption } : img))
  }

  function removeImage(i) {
    onChange(imgs.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-2">
      {/* Gallery */}
      {imgs.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {imgs.map((img, i) => (
            <div key={i} className="flex flex-col gap-1.5" style={{ width: '180px' }}>
              <div className="relative group border border-gray-200 rounded overflow-hidden bg-gray-50">
                <img
                  src={img.src}
                  alt={img.caption || `Image ${i + 1}`}
                  className="w-full h-36 object-cover cursor-zoom-in"
                  onClick={() => setLightboxSrc(img.src)} />
                {!disabled && (
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs font-bold flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                )}
              </div>
              <input
                type="text"
                value={img.caption}
                onChange={e => updateCaption(i, e.target.value)}
                disabled={disabled}
                placeholder={`e.g. Chart ${i + 1}`}
                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Paste / drop zone */}
      {!disabled && (
        <div
          tabIndex={0}
          onPaste={handlePaste}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded px-4 py-3 text-center text-xs text-gray-400 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400
            ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'}`}>
          {label}
        </div>
      )}

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  )
}

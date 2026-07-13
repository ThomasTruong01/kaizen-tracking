// BaselineEntries.jsx — Baseline / Background section
// Each entry holds one or more images + a text description.
// Clicking a thumbnail expands it and reveals the caption below it.

import { useState } from 'react'
import { useKaizenForm } from '../../context/KaizenFormContext'
import { ImagePasteZone } from '../shared/ImagePasteZone'
import { Lightbox } from '../shared/Lightbox'

function SavedEntry({ entry, index, onRemove, disabled }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const lightboxImages = entry.images.map(src => ({ src, text: entry.text || undefined }))

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Entry header */}
      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Entry {index + 1}
        </span>
        {!disabled && (
          <button onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-600 font-semibold">
            Remove
          </button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Thumbnails — click to open gallery popup */}
        {entry.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.images.map((src, i) => (
              <div key={i} onClick={() => setLightboxIndex(i)}
                className="w-20 h-14 border-2 border-gray-200 rounded overflow-hidden cursor-zoom-in hover:border-blue-300 transition-colors">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Text always shown below thumbnails */}
        {entry.text && (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox images={lightboxImages} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </div>
  )
}

export default function BaselineEntries({ disabled }) {
  const { form, setForm } = useKaizenForm()
  const entries = form.baselineEntries || []

  const [pendingImages, setPendingImages] = useState([])
  const [pendingText,   setPendingText]   = useState('')

  function handleSave() {
    if (!pendingImages.length && !pendingText.trim()) return
    setForm({
      baselineEntries: [
        ...entries,
        { id: Date.now(), images: pendingImages, text: pendingText.trim() },
      ]
    })
    setPendingImages([])
    setPendingText('')
  }

  function handleRemove(i) {
    setForm({ baselineEntries: entries.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="space-y-3">
      {/* Saved entries */}
      {entries.map((entry, i) => (
        <SavedEntry key={entry.id} entry={entry} index={i}
          onRemove={() => handleRemove(i)} disabled={disabled} />
      ))}

      {/* Add entry form */}
      {!disabled && (
        <div className="border border-dashed border-gray-300 rounded-md p-3 space-y-3 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {entries.length === 0 ? 'Add Baseline Entry' : 'Add Another Entry'}
          </p>
          <ImagePasteZone images={pendingImages} onChange={setPendingImages} />
          <textarea value={pendingText} onChange={e => setPendingText(e.target.value)}
            rows={3} placeholder="Describe the current state, process background, and baseline metrics..."
            className="w-full text-sm border border-gray-300 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
          <button onClick={handleSave}
            disabled={!pendingImages.length && !pendingText.trim()}
            className="text-sm font-semibold bg-blue-600 text-white rounded px-4 py-1.5 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
            + Save Entry
          </button>
        </div>
      )}

      {disabled && entries.length === 0 && (
        <p className="text-xs text-gray-400 italic">No baseline entries recorded.</p>
      )}
    </div>
  )
}

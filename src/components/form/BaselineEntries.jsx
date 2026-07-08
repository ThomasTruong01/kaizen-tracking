// BaselineEntries.jsx — Baseline / Background section
// Each entry holds one or more images + a text description.
// Clicking a thumbnail expands it and reveals the caption below it.

import { useState } from 'react'
import { useKaizenForm } from '../../context/KaizenFormContext'
import { ImagePasteZone } from '../shared/ImagePasteZone'

function SavedEntry({ entry, index, onRemove, disabled }) {
  const [activeImg, setActiveImg] = useState(null)

  function toggle(i) {
    setActiveImg(prev => (prev === i ? null : i))
  }

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
        {/* Thumbnails — click to expand */}
        {entry.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.images.map((src, i) => (
              <div key={i} onClick={() => toggle(i)}
                title={activeImg === i ? 'Click to collapse' : 'Click to expand'}
                className={`w-20 h-14 border-2 rounded overflow-hidden cursor-pointer transition-all
                  ${activeImg === i
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300'}`}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Expanded image + caption */}
        {activeImg !== null && entry.images[activeImg] && (
          <div className="space-y-2">
            <img src={entry.images[activeImg]} alt=""
              className="max-h-72 max-w-full rounded border border-gray-200 object-contain" />
            {entry.text && (
              <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded px-3 py-2 leading-relaxed whitespace-pre-wrap">
                {entry.text}
              </p>
            )}
          </div>
        )}

        {/* If no images, always show text */}
        {entry.images.length === 0 && entry.text && (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
        )}
      </div>
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

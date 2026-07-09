// KpiCard.jsx — Section 4: Check — KPI tracking cards with weekly updates

import { useState } from 'react'
import { useKaizenForm } from '../../../context/KaizenFormContext'
import { AccordionSection } from '../../shared/AccordionSection'
import { AddLineList } from '../../shared/AddLineList'
import { ImagePasteZone } from '../../shared/ImagePasteZone'
import { Lightbox } from '../../shared/Lightbox'

function WeekEntry({ entry, onRemove }) {
  const [open, setOpen] = useState(true)
  const [lightboxSrc, setLightboxSrc] = useState(null)

  // Normalize: support old plain-string arrays and new { src, caption } objects
  const imgs = (entry.images || []).map(img =>
    typeof img === 'string' ? { src: img, caption: '' } : img
  )

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden mb-2">
      <div className="flex items-center bg-gray-50 border-b border-gray-100 px-3 py-2 cursor-pointer"
        onClick={() => setOpen(o => !o)}>
        <span className="text-xs text-gray-400 mr-2">{open ? '▾' : '▸'}</span>
        <span className="flex-1 text-sm font-semibold text-gray-700">{entry.label}</span>
        <button onClick={e => { e.stopPropagation(); onRemove() }}
          className="text-xs text-red-400 hover:text-red-600 font-semibold ml-2">Remove</button>
      </div>
      {open && (
        <div className="p-3 space-y-3 bg-white">
          {imgs.map((img, i) => (
            <div key={i} className="space-y-1">
              <img src={img.src} alt={img.caption || `Chart ${i + 1}`}
                className="w-full rounded border border-gray-200 cursor-zoom-in"
                onClick={() => setLightboxSrc(img.src)} />
              {img.caption && (
                <p className="text-xs text-gray-500 font-medium">{img.caption}</p>
              )}
            </div>
          ))}
          {entry.notes && (
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">{entry.notes}</pre>
          )}
        </div>
      )}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  )
}

function KpiCard({ card, cardIndex, onUpdate }) {
  const [pendingImages, setPendingImages] = useState([])
  const [pendingNotes,  setPendingNotes]  = useState(card.notes || '')

  function handleUpdate() {
    const weekNum = (card.history || []).length + 1
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const entry = { label: `Week ${weekNum} — ${dateStr}`, images: pendingImages, notes: pendingNotes }
    onUpdate({ ...card, history: [...(card.history || []), entry], images: [], notes: '' })
    setPendingImages([])
    setPendingNotes('')
  }

  function removeHistoryEntry(i) {
    onUpdate({ ...card, history: card.history.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
      {/* Card header */}
      <div className="bg-purple-50 border-b border-purple-200 px-4 py-2.5 flex items-center gap-2">
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">KPI {cardIndex + 1}</span>
        <span className="text-sm font-bold text-gray-800 flex-1">{card.name || `KPI ${cardIndex + 1}`}</span>
      </div>
      <div className="p-4 space-y-4">
        {/* History entries */}
        {(card.history || []).length > 0 && (
          <div>
            {card.history.map((entry, i) => (
              <WeekEntry key={i} entry={entry} onRemove={() => removeHistoryEntry(i)} />
            ))}
          </div>
        )}

        {/* Active paste zone + notes */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">New Chart / Screenshot</label>
          <ImagePasteZone images={pendingImages} onChange={setPendingImages} label="📎 Paste or drag-drop chart here (Ctrl+V)" />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
          <textarea value={pendingNotes} onChange={e => setPendingNotes(e.target.value)}
            rows={3} placeholder="Add performance commentary, data, or observations..."
            className="w-full text-sm border border-gray-300 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
        </div>
        <button onClick={handleUpdate}
          disabled={!pendingImages.length && !pendingNotes.trim()}
          className="text-sm font-semibold bg-purple-600 text-white rounded px-4 py-1.5 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed">
          + Update
        </button>
      </div>
    </div>
  )
}

export default function Check() {
  const { form, setForm } = useKaizenForm()
  const kpiCards = form.kpiCards || []

  function updateCard(i, val) {
    const next = [...kpiCards]; next[i] = val
    setForm({ kpiCards: next })
  }

  return (
    <AccordionSection title="Check" stage="plan" defaultOpen={true}>

      {/* KPI cards */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Measurement Tracking Indicators</h3>
        {kpiCards.length === 0
          ? <p className="text-xs text-gray-400 italic">No Key Measurements defined yet — add them in the Plan section to generate KPI cards here.</p>
          : kpiCards.map((card, i) => (
              <KpiCard key={card.id ?? i} card={card} cardIndex={i} onUpdate={val => updateCard(i, val)} />
            ))
        }
      </div>

      {/* Achieved Results */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">Achieved Results</h3>
        <AddLineList value={form.achievedResults} onChange={v => setForm({ achievedResults: v })}
          placeholder="List a result achieved..." />
      </div>

      {/* Analysis of Gaps */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">Analysis of Gaps</h3>
        <textarea value={form.analysisOfGaps} onChange={e => setForm({ analysisOfGaps: e.target.value })}
          rows={4} placeholder="Describe gaps between current state and target future state. Document last unresolved gaps identified during this project cycle."
          className="w-full text-sm border border-gray-300 rounded px-2.5 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
      </div>

      {/* Section completion */}
      <div className={`flex items-center justify-between pt-3 border-t ${form.checkComplete ? 'border-green-200' : 'border-gray-100'}`}>
        {form.checkComplete ? (
          <>
            <span className="text-sm font-semibold text-green-700">✓ Check marked complete — 20%</span>
            <button onClick={() => setForm({ checkComplete: false })}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Reopen
            </button>
          </>
        ) : (
          <button onClick={() => setForm({ checkComplete: true })}
            className="text-sm bg-green-600 text-white font-semibold rounded px-4 py-2 hover:bg-green-700">
            ✓ Mark Check Complete
          </button>
        )}
      </div>

    </AccordionSection>
  )
}

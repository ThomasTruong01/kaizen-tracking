// FiveWhy.jsx — Interactive 5-Why progressive chain

import { useKaizenForm } from '../../../context/KaizenFormContext'

function WhyChain({ chain, chainIndex, onChange, onRemove, isLast }) {
  const { whys, problem, rootCause } = chain

  function updateProblem(val) {
    const next = { ...chain, problem: val }
    if (!val) next.whys = ['', '', '', '', '']
    onChange(next)
  }

  function updateWhy(i, val) {
    const nextWhys = [...whys]
    // Cascade clear downstream
    nextWhys[i] = val
    if (!val) { for (let j = i + 1; j < 5; j++) nextWhys[j] = '' }
    onChange({ ...chain, whys: nextWhys })
  }

  // Determine how many whys to show
  let showUntil = 0
  if (problem.trim()) showUntil = 1
  for (let i = 0; i < 5; i++) {
    if (whys[i]?.trim()) showUntil = i + 2
  }
  showUntil = Math.min(showUntil, 5)

  function whyPrompt(i) {
    const prev = i === 0 ? problem : whys[i - 1]
    return prev.trim() ? `Why ${prev.trim()}?` : 'Why?'
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <span className="text-sm font-bold text-gray-700">5-Why #{chainIndex + 1}</span>
        {!isLast && (
          <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-semibold">Remove</button>
        )}
      </div>
      <div className="p-4 space-y-4">

        {/* Problem Statement */}
        <div>
          <label className="block text-sm font-bold text-red-700 mb-1">Problem Statement:</label>
          <textarea value={problem} onChange={e => updateProblem(e.target.value)}
            rows={2} placeholder="Describe the problem (e.g. High rejection rate on Tapes/Adhesives)..."
            className="w-full text-sm border border-gray-300 rounded px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
        </div>

        {/* Progressive Whys */}
        {Array.from({ length: showUntil }, (_, i) => (
          <div key={i}>
            <p className="text-sm font-bold text-gray-800 mb-1">{whyPrompt(i)}</p>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Because</span>
            <textarea value={whys[i] || ''} onChange={e => updateWhy(i, e.target.value)}
              rows={2} placeholder="..."
              className="w-full text-sm border border-gray-300 rounded px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans" />
          </div>
        ))}

        {/* Root Cause — appears as soon as the first Why is answered */}
        {whys[0]?.trim() && (
          <div className="border-t border-dashed border-gray-300 pt-4">
            <label className="block text-sm font-bold text-green-700 mb-1">Root Cause:</label>
            <textarea value={rootCause} onChange={e => onChange({ ...chain, rootCause: e.target.value })}
              rows={2} placeholder="Summarize the root cause identified by this 5-Why..."
              className="w-full text-sm border border-green-200 bg-green-50 rounded px-3 py-2 resize-vertical focus:outline-none focus:ring-2 focus:ring-green-400 font-sans" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function FiveWhy() {
  const { form, setForm } = useKaizenForm()
  const chains = form.whyChains || [{ problem: '', whys: ['','','','',''], rootCause: '' }]

  function updateChain(i, val) {
    const next = [...chains]; next[i] = val
    setForm({ whyChains: next })
  }

  function addChain() {
    setForm({ whyChains: [...chains, { problem: '', whys: ['','','','',''], rootCause: '' }] })
  }

  function removeChain(i) {
    if (chains.length === 1) return
    setForm({ whyChains: chains.filter((_, idx) => idx !== i) })
  }

  return (
    <div>
      {chains.map((chain, i) => (
        <WhyChain key={i} chain={chain} chainIndex={i}
          onChange={val => updateChain(i, val)}
          onRemove={() => removeChain(i)}
          isLast={chains.length === 1} />
      ))}
      <button onClick={addChain}
        className="text-sm font-semibold text-blue-600 hover:text-blue-800">
        + Add Another 5-Why
      </button>
    </div>
  )
}

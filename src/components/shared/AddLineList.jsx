// AddLineList.jsx — Numbered add-line list used in Plan, Check, Act, Wrap-Up

export function AddLineList({ value = [''], onChange, placeholder = 'Add item...', disabled = false }) {
  const items = value.length > 0 ? value : ['']

  function update(i, v) {
    const next = [...items]; next[i] = v; onChange(next)
  }
  function add() { onChange([...items, '']) }
  function remove(i) {
    if (items.length === 1) { onChange(['']); return }
    onChange(items.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-400 w-6 text-right flex-shrink-0">{i + 1}.</span>
          <input type="text" value={item} onChange={e => update(i, e.target.value)}
            placeholder={placeholder} disabled={disabled}
            className="flex-1 text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400" />
          {!disabled && (
            <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 text-xl leading-none flex-shrink-0" title="Remove">×</button>
          )}
        </div>
      ))}
      {!disabled && (
        <button onClick={add} className="text-sm font-semibold text-blue-600 hover:text-blue-800 mt-1">+ Add Line</button>
      )}
    </div>
  )
}

// PdfUploadZone.jsx — drag-drop or click to upload PDF files, stored as base64 data URLs

import { useRef } from 'react'

export function PdfUploadZone({ files = [], onChange, disabled }) {
  const inputRef = useRef(null)

  function readFiles(fileList) {
    const pdfs = Array.from(fileList).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdfs.length) return
    Promise.all(pdfs.map(f => new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve({ name: f.name, dataUrl: e.target.result, size: f.size })
      reader.readAsDataURL(f)
    }))).then(added => onChange([...files, ...added]))
  }

  function remove(i) {
    onChange(files.filter((_, idx) => idx !== i))
  }

  function fmt(bytes) {
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-2">
      {!disabled && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={e => { e.preventDefault(); readFiles(e.dataTransfer.files) }}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-md p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors select-none">
          <p className="text-sm text-gray-500">📎 Click or drag a PDF here</p>
          <p className="text-xs text-gray-400 mt-1">PDF files only</p>
          <input ref={inputRef} type="file" accept=".pdf,application/pdf"
            multiple className="hidden"
            onChange={e => { readFiles(e.target.files); e.target.value = '' }} />
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2">
              <span className="text-red-500 flex-shrink-0">📄</span>
              <span className="text-sm text-gray-800 flex-1 truncate">{f.name}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">{fmt(f.size)}</span>
              <a href={f.dataUrl} download={f.name}
                className="text-xs text-blue-600 hover:underline flex-shrink-0">Download</a>
              {!disabled && (
                <button onClick={() => remove(i)}
                  className="text-red-400 hover:text-red-600 text-base leading-none flex-shrink-0">×</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

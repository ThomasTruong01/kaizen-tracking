// Act.jsx — Section 5: Act

import { useKaizenForm } from '../../context/KaizenFormContext'
import { AccordionSection } from '../shared/AccordionSection'
import { AddLineList } from '../shared/AddLineList'
import { ImagePasteZone } from '../shared/ImagePasteZone'

export default function Act() {
  const { form, setForm } = useKaizenForm()
  return (
    <AccordionSection title="5. Act" stage="act" defaultOpen={true}>

      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Standardize – Actions Implemented</h3>
        <p className="text-xs text-gray-400 mb-3">
          Reference SOPs, visual aids, process/sub-process documentation. Were any documents created? Was a procedure established?
        </p>
        <AddLineList value={form.standardizeActions}
          onChange={v => setForm({ standardizeActions: v })}
          placeholder="e.g. Updated QA.P02.W04 Rev. C to reflect new process..." />
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Evidence</label>
          <ImagePasteZone
            images={form.standardizeEvidence || []}
            onChange={imgs => setForm({ standardizeEvidence: imgs })}
            label="📎 Paste or drag-drop evidence (screenshots, photos)" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-1">Assure Maintenance / Actions Implemented</h3>
        <p className="text-xs text-gray-400 mb-3">
          Reference monitoring of SOPs, LPA, internal audits, training. Was any training provided? How? To whom?
        </p>
        <AddLineList value={form.assureMaintenanceActions}
          onChange={v => setForm({ assureMaintenanceActions: v })}
          placeholder="e.g. Trained all production assemblers on new taping process 06/30/2026..." />
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Evidence</label>
          <ImagePasteZone
            images={form.assureEvidence || []}
            onChange={imgs => setForm({ assureEvidence: imgs })}
            label="📎 Paste or drag-drop evidence (screenshots, photos)" />
        </div>
      </div>

      {/* Section completion */}
      <div className={`flex items-center justify-between pt-3 border-t ${form.actComplete ? 'border-green-200' : 'border-gray-100'}`}>
        {form.actComplete ? (
          <>
            <span className="text-sm font-semibold text-green-700">✓ Act marked complete — 20%</span>
            <button onClick={() => setForm({ actComplete: false })}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Reopen
            </button>
          </>
        ) : (
          <button onClick={() => setForm({ actComplete: true })}
            className="text-sm bg-green-600 text-white font-semibold rounded px-4 py-2 hover:bg-green-700">
            ✓ Mark Act Complete
          </button>
        )}
      </div>

    </AccordionSection>
  )
}

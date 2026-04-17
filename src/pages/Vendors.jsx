import React, { useState } from 'react';
import { useVendors } from '../context/VendorContext';
import { useToast } from '../components/Toast';

export default function Vendors() {
  const { vendors, addVendor } = useVendors();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', gstin: '', layout: 'Structured table', keyword: '', totalKeyword: '' });
  const [errors, setErrors] = useState({});

  const handleSave = () => {
    if (!formData.name.trim()) {
      setErrors({ name: 'Vendor name is required' });
      return;
    }
    setErrors({});
    addVendor({ name: formData.name, gstin: formData.gstin, layout: formData.layout });
    setShowModal(false);
    toast('✅ Vendor template saved', 'green');
    setFormData({ name: '', gstin: '', layout: 'Structured table', keyword: '', totalKeyword: '' });
  };

  return (
    <div className="col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Vendor Templates</h2>
          <p className="text-t2 text-sm">Per-vendor extraction rules improve accuracy on repeat invoices.</p>
        </div>
        <button className="btn bp" onClick={() => setShowModal(true)}>+ Add Vendor</button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>GSTIN</th>
              <th>Layout</th>
              <th>Source</th>
              <th style={{ textAlign: 'center' }}>Invoices</th>
              <th>Accuracy</th>
              <th>Template</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td className="mono text-t2 text-xs">{v.gstin || '—'}</td>
                <td><span className="badge b-n" style={{ backgroundColor: 'var(--s2)' }}>{v.layout}</span></td>
                <td>
                  <span className="badge b-n" style={{ backgroundColor: 'var(--s2)' }}>
                    {v.source === 'Email' ? '📧' : '📤'} {v.source}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>{v.invoices}</td>
                <td>
                  {typeof v.accuracy === 'number' ? (
                    <span className={v.accuracy >= 90 ? 'text-green' : v.accuracy >= 80 ? 'text-amber' : 'text-red'}>
                      {v.accuracy}%
                    </span>
                  ) : <span className="text-t3">—</span>}
                </td>
                <td>
                  <span className={`badge ${v.status === 'Active' ? 'b-s' : 'b-w'}`}>{v.status}</span>
                </td>
                <td>
                  <button className="btn bg btn-xs" onClick={() => toast('✏️ Edit coming in Phase 2', 'blue')}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }} onClick={e => e.stopPropagation()}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>Add Vendor Template</h2>
              <p className="text-t2 text-xs">Define extraction rules for a new vendor.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Vendor Name *</label>
              <input type="text" className="input" placeholder="e.g. Infosys Limited" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ borderColor: errors.name ? 'var(--red)' : undefined }} />
              {errors.name && <span className="text-red text-xs mt-1">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input type="text" className="input" placeholder="e.g. 29AABCI1234A1Z1" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Layout Type</label>
              <select className="select" value={formData.layout} onChange={e => setFormData({ ...formData, layout: e.target.value })}>
                <option>Structured table</option>
                <option>Semi-structured</option>
                <option>Free form</option>
                <option>Scanned only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Number Keyword</label>
              <input type="text" className="input" placeholder='e.g. "Invoice No:" or "Inv #"' value={formData.keyword} onChange={e => setFormData({ ...formData, keyword: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Total Amount Keyword</label>
              <input type="text" className="input" placeholder='e.g. "Total Due", "Amount Payable"' value={formData.totalKeyword} onChange={e => setFormData({ ...formData, totalKeyword: e.target.value })} />
            </div>

            <div className="flex justify-between items-center" style={{ justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button className="btn bg btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn bp" onClick={handleSave}>Save Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

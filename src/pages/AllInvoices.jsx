import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AllInvoices() {
  const navigate = useNavigate();

  const handleRowClick = () => navigate('/review');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Context Row */}
      <div className="flex items-center justify-between">
        <div style={{ color: 'var(--t2)', fontSize: '13px' }}>
          147 invoices · 3 pending review · 2 duplicates blocked
        </div>
        <div className="flex items-center gap-3">
          <select className="select">
            <option>All Status</option>
            <option>Reviewed</option>
            <option>Pending</option>
          </select>
          <select className="select">
            <option>All Vendors</option>
            <option>TCS</option>
            <option>Infosys</option>
          </select>
          <button className="btn bg">Export All</button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--b)' }}>
          <h2 style={{ fontSize: '16px' }}>Invoice Records</h2>
          <input className="input" placeholder="Filter..." style={{ width: '170px' }} />
        </div>

        <div className="overflow-y-auto w-full">
          <table style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>☐</th>
                <th>Invoice No.</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Total (INR)</th>
                <th>Source</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr style={{ cursor: 'pointer' }} onClick={handleRowClick}>
                <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>☐</td>
                <td>INV-2024/03/12</td>
                <td>Infosys Ltd</td>
                <td>12 Mar 2024</td>
                <td>₹12,45,000</td>
                <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>📧 Email</div></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-container" style={{ width: '60px' }}>
                      <div className="pb-gr h-full" style={{ width: '97%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-green">97%</span>
                  </div>
                </td>
                <td><span className="badge b-s">Reviewed</span></td>
                <td><button className="btn bg btn-xs" onClick={e => { e.stopPropagation(); handleRowClick(); }}>View</button></td>
              </tr>

              {/* Row 2 */}
              <tr style={{ cursor: 'pointer' }} onClick={handleRowClick}>
                <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>☐</td>
                <td>INV-2024/03/11</td>
                <td>TCS Limited</td>
                <td>11 Mar 2024</td>
                <td>₹8,59,040</td>
                <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>📤 Upload</div></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-container" style={{ width: '60px' }}>
                      <div className="pb-am h-full" style={{ width: '86%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-amber">86%</span>
                  </div>
                </td>
                <td><span className="badge b-w">Pending</span></td>
                <td><button className="btn bg btn-xs" onClick={e => { e.stopPropagation(); handleRowClick(); }}>Review</button></td>
              </tr>

              {/* Row 3 */}
              <tr style={{ cursor: 'pointer' }} onClick={handleRowClick}>
                <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>☐</td>
                <td>INV-2024/03/10</td>
                <td>Wipro Ltd</td>
                <td>10 Mar 2024</td>
                <td>₹3,24,500</td>
                <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>📧 Email</div></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-container" style={{ width: '60px' }}>
                      <div className="pb-gr h-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-green">94%</span>
                  </div>
                </td>
                <td><span className="badge b-s">Exported</span></td>
                <td><button className="btn bg btn-xs" onClick={e => e.stopPropagation()}>Download</button></td>
              </tr>

              {/* Row 4 */}
              <tr style={{ cursor: 'pointer' }} onClick={handleRowClick}>
                <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>☐</td>
                <td>INV-2024/03/09</td>
                <td>TCS Limited</td>
                <td>09 Mar 2024</td>
                <td>₹8,59,040</td>
                <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>📤 Upload</div></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-container" style={{ width: '60px' }}>
                      <div className="pb-bl h-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-accent">100%</span>
                  </div>
                </td>
                <td><span className="badge b-e">Duplicate</span></td>
                <td><button className="btn bg btn-xs" onClick={e => e.stopPropagation()}>Details</button></td>
              </tr>

              {/* Row 5 */}
              <tr style={{ cursor: 'pointer' }} onClick={handleRowClick}>
                <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>☐</td>
                <td>INV-2024/03/08</td>
                <td>Accenture</td>
                <td>08 Mar 2024</td>
                <td>₹21,80,000</td>
                <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--s2)', padding: '2px 8px', borderRadius: 'var(--rs)', fontSize: '12px' }}>📧 Email</div></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-container" style={{ width: '60px' }}>
                      <div className="pb-am h-full" style={{ width: '79%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-amber">79%</span>
                  </div>
                </td>
                <td><span className="badge b-w">Pending</span></td>
                <td><button className="btn bg btn-xs" onClick={e => { e.stopPropagation(); handleRowClick(); }}>Review</button></td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderTop: '1px solid var(--b)', fontSize: '13px', color: 'var(--t2)' }}>
          <div>Showing 5 of 147</div>
          <div className="flex items-center gap-1">
            <button className="btn bg btn-sm" style={{ padding: '4px 8px' }}>← Prev</button>
            <button className="btn" style={{ padding: '4px 10px', backgroundColor: 'var(--accent)', color: '#fff' }}>1</button>
            <button className="btn bg" style={{ padding: '4px 10px', border: 'none' }}>2</button>
            <button className="btn bg" style={{ padding: '4px 10px', border: 'none' }}>3</button>
            <button className="btn bg btn-sm" style={{ padding: '4px 8px' }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
}

export default function CashflowPage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '' });
  const { addToast } = useToast();

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const res = await api.get(`/reports/cashflow?${params.toString()}`);
      setData(res.data);
      setSummary(res.summary);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      await api.exportExcel(`/reports/cashflow/export?${params.toString()}`);
      addToast('Export berhasil!', 'success');
    } catch (err) { addToast('Export gagal.', 'error'); }
  };

  const columns = [
    { key: 'no', label: 'No', render: (_, i) => i + 1 },
    { key: 'date', label: 'Tanggal', render: (r) => new Date(r.date).toLocaleDateString('id-ID') },
    { key: 'referenceNumber', label: 'No. Referensi' },
    {
      key: 'type', label: 'Tipe',
      render: (r) => <span className={`badge ${r.type === 'SALE' ? 'badge-green' : 'badge-purple'}`}>{r.type === 'SALE' ? 'Penjualan' : 'Pembelian'}</span>,
    },
    { key: 'party', label: 'Pihak', render: (r) => r.partyName || '-' },
    {
      key: 'income', label: 'Pemasukan', cellStyle: { textAlign: 'right' },
      render: (r) => r.type === 'SALE' ? <span className="text-success" style={{ fontWeight: 700 }}>{formatRupiah(r.totalAmount)}</span> : '-',
    },
    {
      key: 'expense', label: 'Pengeluaran', cellStyle: { textAlign: 'right' },
      render: (r) => r.type === 'PURCHASE' ? <span className="text-danger" style={{ fontWeight: 700 }}>{formatRupiah(r.totalAmount)}</span> : '-',
    },
  ];

  return (
    <>
      <Header title="💹 Laporan Cashflow" subtitle="Arus kas masuk dan keluar" />

      <div className="card mb-3">
        <div className="report-filters">
          <div className="form-group">
            <label className="form-label">Dari Tanggal</label>
            <input className="form-input" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Sampai Tanggal</label>
            <input className="form-input" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <div className="flex gap-1">
              <button className="btn btn-primary" onClick={loadReport}>🔍 Tampilkan</button>
              <button className="btn btn-success" onClick={handleExport} disabled={data.length === 0}>📥 Export Excel</button>
            </div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="report-summary mb-3">
          <div className="report-summary-card">
            <div className="report-summary-label">Total Pemasukan</div>
            <div className="report-summary-value income">{formatRupiah(summary.totalIncome)}</div>
          </div>
          <div className="report-summary-card">
            <div className="report-summary-label">Total Pengeluaran</div>
            <div className="report-summary-value expense">{formatRupiah(summary.totalExpense)}</div>
          </div>
          <div className="report-summary-card">
            <div className="report-summary-label">Net Cashflow</div>
            <div className={`report-summary-value ${summary.net >= 0 ? 'income' : 'expense'}`}>{formatRupiah(summary.net)}</div>
          </div>
        </div>
      )}

      <div className="card">
        <DataTable columns={columns} data={data} loading={loading} emptyMessage="Klik 'Tampilkan' untuk melihat data cashflow." />
      </div>
    </>
  );
}

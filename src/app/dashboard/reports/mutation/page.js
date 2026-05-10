'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
}

export default function MutationPage() {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ productId: '', from: '', to: '' });
  const { addToast } = useToast();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products/all');
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.productId) params.append('productId', filters.productId);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const res = await api.get(`/reports/mutation?${params.toString()}`);
      setData(res.data);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.productId) params.append('productId', filters.productId);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      await api.exportExcel(`/reports/mutation/export?${params.toString()}`);
      addToast('Export berhasil!', 'success');
    } catch (err) { addToast('Export gagal.', 'error'); }
  };

  const typeMap = {
    INCOMING: { label: 'Masuk', badge: 'badge-blue' },
    OUTGOING: { label: 'Keluar', badge: 'badge-orange' },
    SALE: { label: 'Jual', badge: 'badge-green' },
    PURCHASE: { label: 'Beli', badge: 'badge-purple' },
  };

  const columns = [
    { key: 'no', label: 'No', render: (_, i) => i + 1 },
    { key: 'date', label: 'Tanggal', render: (r) => new Date(r.date).toLocaleDateString('id-ID') },
    { key: 'referenceNumber', label: 'No. Referensi' },
    { key: 'type', label: 'Tipe', render: (r) => <span className={`badge ${typeMap[r.type]?.badge || 'badge-blue'}`}>{typeMap[r.type]?.label || r.type}</span> },
    { key: 'productName', label: 'Barang' },
    {
      key: 'masuk', label: 'Masuk', cellStyle: { textAlign: 'center' },
      render: (r) => (r.type === 'INCOMING' || r.type === 'PURCHASE') ? <span className="text-success" style={{ fontWeight: 700 }}>+{r.quantity}</span> : '-',
    },
    {
      key: 'keluar', label: 'Keluar', cellStyle: { textAlign: 'center' },
      render: (r) => (r.type === 'OUTGOING' || r.type === 'SALE') ? <span className="text-danger" style={{ fontWeight: 700 }}>-{r.quantity}</span> : '-',
    },
    { key: 'total', label: 'Nilai', cellStyle: { textAlign: 'right' }, render: (r) => formatRupiah(r.total) },
  ];

  return (
    <>
      <Header title="🔄 Laporan Mutasi Barang" subtitle="Lihat pergerakan masuk dan keluar barang" />

      <div className="card mb-3">
        <div className="report-filters">
          <div className="form-group">
            <label className="form-label">Produk</label>
            <select className="form-select" value={filters.productId} onChange={(e) => setFilters({ ...filters, productId: e.target.value })} style={{ minWidth: '200px' }}>
              <option value="">Semua Produk</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
            </select>
          </div>
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

      <div className="card">
        <DataTable columns={columns} data={data} loading={loading} emptyMessage="Klik 'Tampilkan' untuk melihat data mutasi." />
      </div>
    </>
  );
}

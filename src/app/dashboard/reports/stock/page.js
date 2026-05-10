'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
}

export default function StockPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { loadReport(); }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/stock');
      setData(res.data);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    try {
      await api.exportExcel('/reports/stock/export');
      addToast('Export berhasil!', 'success');
    } catch (err) { addToast('Export gagal.', 'error'); }
  };

  const totalValue = data.reduce((sum, p) => sum + Number(p.buyPrice) * p.stock, 0);
  const lowStockCount = data.filter((p) => p.stock <= p.minStock).length;

  const columns = [
    { key: 'no', label: 'No', render: (_, i) => i + 1 },
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Nama Barang' },
    { key: 'unit', label: 'Satuan' },
    { key: 'buyPrice', label: 'Harga Beli', cellStyle: { textAlign: 'right' }, render: (r) => formatRupiah(r.buyPrice) },
    { key: 'sellPrice', label: 'Harga Jual', cellStyle: { textAlign: 'right' }, render: (r) => formatRupiah(r.sellPrice) },
    {
      key: 'stock', label: 'Stok', cellStyle: { textAlign: 'center' },
      render: (r) => {
        const isLow = r.stock <= r.minStock;
        return (
          <div>
            <span style={{ color: isLow ? 'var(--danger)' : 'var(--success)', fontWeight: 700, fontSize: '1.05rem' }}>{r.stock}</span>
            {isLow && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--danger)' }}>⚠️ Low Stock</span>}
          </div>
        );
      },
    },
    { key: 'minStock', label: 'Min Stok', cellStyle: { textAlign: 'center' } },
    {
      key: 'value', label: 'Nilai Stok', cellStyle: { textAlign: 'right', fontWeight: 600 },
      render: (r) => formatRupiah(Number(r.buyPrice) * r.stock),
    },
  ];

  return (
    <>
      <Header title="📋 Cek Stok Barang" subtitle="Laporan stok barang terkini" />

      <div className="report-summary mb-3">
        <div className="report-summary-card">
          <div className="report-summary-label">Total Produk</div>
          <div className="report-summary-value">{data.length}</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Total Stok</div>
          <div className="report-summary-value">{data.reduce((s, p) => s + p.stock, 0).toLocaleString('id-ID')}</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Nilai Stok</div>
          <div className="report-summary-value income">{formatRupiah(totalValue)}</div>
        </div>
        <div className="report-summary-card">
          <div className="report-summary-label">Low Stock</div>
          <div className="report-summary-value expense">{lowStockCount}</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left" />
        <div className="toolbar-right">
          <button className="btn btn-success" onClick={handleExport}>📥 Export Excel</button>
          <button className="btn btn-secondary" onClick={loadReport}>🔄 Refresh</button>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={data} loading={loading} />
      </div>
    </>
  );
}

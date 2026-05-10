'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [form, setForm] = useState({ sku: '', name: '', description: '', unit: 'pcs', buyPrice: 0, sellPrice: 0, stock: 0, minStock: 0 });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { loadProducts(); }, [page, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/products?page=${page}&limit=10&search=${search}`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditProd(null);
    setForm({ sku: '', name: '', description: '', unit: 'pcs', buyPrice: 0, sellPrice: 0, stock: 0, minStock: 0 });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProd(p);
    setForm({ sku: p.sku, name: p.name, description: p.description || '', unit: p.unit, buyPrice: Number(p.buyPrice), sellPrice: Number(p.sellPrice), stock: p.stock, minStock: p.minStock });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editProd) {
        await api.put(`/products/${editProd.id}`, form);
        addToast('Produk berhasil diupdate!', 'success');
      } else {
        await api.post('/products', form);
        addToast('Produk berhasil dibuat!', 'success');
      }
      setShowModal(false);
      loadProducts();
    } catch (err) { addToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      addToast('Produk berhasil dihapus.', 'success');
      loadProducts();
    } catch (err) { addToast(err.message, 'error'); }
  };

  const columns = [
    { key: 'no', label: 'No', render: (_, i) => (page - 1) * 10 + i + 1 },
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Nama Barang' },
    { key: 'unit', label: 'Satuan' },
    { key: 'buyPrice', label: 'Harga Beli', cellStyle: { textAlign: 'right' }, render: (r) => formatRupiah(r.buyPrice) },
    { key: 'sellPrice', label: 'Harga Jual', cellStyle: { textAlign: 'right' }, render: (r) => formatRupiah(r.sellPrice) },
    {
      key: 'stock', label: 'Stok', cellStyle: { textAlign: 'center' },
      render: (r) => {
        const isLow = r.stock <= r.minStock;
        return <span style={{ color: isLow ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>{r.stock}</span>;
      },
    },
    {
      key: 'actions', label: 'Aksi',
      render: (row) => (
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}>✏️</button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(row)} style={{ color: 'var(--danger)' }}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title="📦 Produk / Barang" subtitle="Kelola master data barang" />
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input placeholder="Cari produk..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Tambah Produk</button>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={products} loading={loading} />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProd ? 'Edit Produk' : 'Tambah Produk Baru'} size="lg"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </>}
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input className="form-input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="PRD-001" />
          </div>
          <div className="form-group">
            <label className="form-label">Nama Barang *</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama barang" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi produk" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Satuan</label>
            <select className="form-select" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              <option value="pcs">Pcs</option>
              <option value="unit">Unit</option>
              <option value="box">Box</option>
              <option value="kg">Kg</option>
              <option value="liter">Liter</option>
              <option value="meter">Meter</option>
              <option value="set">Set</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Stok</label>
            <input className="form-input" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Harga Beli</label>
            <input className="form-input" type="number" value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="form-group">
            <label className="form-label">Harga Jual</label>
            <input className="form-input" type="number" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: parseFloat(e.target.value) || 0 })} />
          </div>
        </div>
        {!editProd && (
          <div className="form-group">
            <label className="form-label">Stok Awal</label>
            <input className="form-input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
          </div>
        )}
      </Modal>
    </>
  );
}

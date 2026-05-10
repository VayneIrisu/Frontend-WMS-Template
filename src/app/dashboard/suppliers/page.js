'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';

export default function SuppliersPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', address: '', email: '' });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { loadData(); }, [page, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/suppliers?page=${page}&limit=10&search=${search}`);
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditItem(null); setForm({ name: '', contact: '', address: '', email: '' }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, contact: item.contact || '', address: item.address || '', email: item.email || '' }); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) { await api.put(`/suppliers/${editItem.id}`, form); addToast('Supplier diupdate!', 'success'); }
      else { await api.post('/suppliers', form); addToast('Supplier ditambahkan!', 'success'); }
      setShowModal(false); loadData();
    } catch (err) { addToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Hapus supplier "${item.name}"?`)) return;
    try { await api.delete(`/suppliers/${item.id}`); addToast('Supplier dihapus.', 'success'); loadData(); }
    catch (err) { addToast(err.message, 'error'); }
  };

  const columns = [
    { key: 'no', label: 'No', render: (_, i) => (page - 1) * 10 + i + 1 },
    { key: 'name', label: 'Nama Supplier' },
    { key: 'contact', label: 'Kontak', render: (r) => r.contact || '-' },
    { key: 'email', label: 'Email', render: (r) => r.email || '-' },
    { key: 'address', label: 'Alamat', render: (r) => r.address || '-' },
    { key: 'actions', label: 'Aksi', render: (row) => (
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}>✏️</button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(row)} style={{ color: 'var(--danger)' }}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title="🏭 Supplier" subtitle="Kelola data supplier" />
      <div className="toolbar">
        <div className="toolbar-left"><div className="search-input"><span className="search-icon">🔍</span><input placeholder="Cari supplier..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div></div>
        <div className="toolbar-right"><button className="btn btn-primary" onClick={openAdd}>+ Tambah Supplier</button></div>
      </div>
      <div className="card">
        <DataTable columns={columns} data={data} loading={loading} />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Supplier' : 'Tambah Supplier'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button></>}>
        <div className="form-group"><label className="form-label">Nama *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Kontak</label><input className="form-input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Alamat</label><textarea className="form-textarea" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      </Modal>
    </>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', level: 3 });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { loadRoles(); }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await api.get('/roles');
      setRoles(data.data);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditRole(null);
    setForm({ name: '', description: '', level: 3 });
    setShowModal(true);
  };

  const openEdit = (role) => {
    setEditRole(role);
    setForm({ name: role.name, description: role.description || '', level: role.level });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editRole) {
        await api.put(`/roles/${editRole.id}`, form);
        addToast('Role berhasil diupdate!', 'success');
      } else {
        await api.post('/roles', form);
        addToast('Role berhasil dibuat!', 'success');
      }
      setShowModal(false);
      loadRoles();
    } catch (err) { addToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (role) => {
    if (!confirm(`Hapus role "${role.name}"?`)) return;
    try {
      await api.delete(`/roles/${role.id}`);
      addToast('Role berhasil dihapus.', 'success');
      loadRoles();
    } catch (err) { addToast(err.message, 'error'); }
  };

  const levelLabels = { 1: 'Admin', 2: 'Manager', 3: 'Staff' };

  const columns = [
    { key: 'no', label: 'No', render: (_, i) => i + 1 },
    { key: 'name', label: 'Nama Role' },
    { key: 'description', label: 'Deskripsi', render: (r) => r.description || '-' },
    {
      key: 'level', label: 'Level',
      render: (r) => {
        const colors = { 1: 'badge-red', 2: 'badge-orange', 3: 'badge-blue' };
        return <span className={`badge ${colors[r.level] || 'badge-blue'}`}>{levelLabels[r.level] || `Level ${r.level}`}</span>;
      },
    },
    { key: 'users', label: 'Jumlah User', render: (r) => r._count?.users || 0 },
    {
      key: 'actions', label: 'Aksi',
      render: (row) => (
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}>✏️ Edit</button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(row)} style={{ color: 'var(--danger)' }}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title="🔐 Master Role" subtitle="Kelola role dan hak akses" />

      <div className="toolbar">
        <div className="toolbar-left" />
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Tambah Role</button>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={roles} loading={loading} emptyMessage="Belum ada role." />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editRole ? 'Edit Role' : 'Tambah Role Baru'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nama Role *</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Supervisor" />
        </div>
        <div className="form-group">
          <label className="form-label">Deskripsi</label>
          <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi role" />
        </div>
        <div className="form-group">
          <label className="form-label">Level Akses *</label>
          <select className="form-select" value={form.level} onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}>
            <option value={1}>1 - Admin (Full Access)</option>
            <option value={2}>2 - Manager (Manage & View)</option>
            <option value={3}>3 - Staff (Basic Access)</option>
          </select>
        </div>
      </Modal>
    </>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', roleId: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { loadUsers(); }, [page, search]);
  useEffect(() => { loadRoles(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/users?page=${page}&limit=10&search=${search}`);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const loadRoles = async () => {
    try {
      const data = await api.get('/roles');
      setRoles(data.data);
    } catch (err) { console.error(err); }
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ username: '', email: '', password: '', fullName: '', roleId: roles[0]?.id || '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ username: user.username, email: user.email, password: '', fullName: user.fullName, roleId: user.roleId, isActive: user.isActive });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editUser) {
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${editUser.id}`, updateData);
        addToast('User berhasil diupdate!', 'success');
      } else {
        await api.post('/users', form);
        addToast('User berhasil dibuat!', 'success');
      }
      setShowModal(false);
      loadUsers();
    } catch (err) { addToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Hapus user "${user.fullName}"?`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      addToast('User berhasil dihapus.', 'success');
      loadUsers();
    } catch (err) { addToast(err.message, 'error'); }
  };

  const columns = [
    { key: 'no', label: 'No', render: (_, i) => (page - 1) * 10 + i + 1 },
    { key: 'fullName', label: 'Nama Lengkap' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <span className="badge badge-blue">{row.role?.name}</span> },
    {
      key: 'isActive', label: 'Status',
      render: (row) => <span className={`badge ${row.isActive ? 'badge-green' : 'badge-red'}`}>{row.isActive ? 'Aktif' : 'Nonaktif'}</span>,
    },
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
      <Header title="👤 Master User" subtitle="Kelola data pengguna sistem" />

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input placeholder="Cari user..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Tambah User</button>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={users} loading={loading} emptyMessage="Belum ada user." />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? 'Edit User' : 'Tambah User Baru'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nama Lengkap *</label>
            <input className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Nama lengkap" />
          </div>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input className="form-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password {editUser ? '(kosongkan jika tidak diubah)' : '*'}</label>
            <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-select" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: parseInt(e.target.value) })}>
              <option value="">Pilih Role</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}

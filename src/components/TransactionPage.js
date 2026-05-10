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

export default function TransactionPage({ type, title, icon, partyType }) {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [products, setProducts] = useState([]);
  const [parties, setParties] = useState([]);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    partyId: '',
    items: [{ productId: '', quantity: 1, price: 0 }],
  });

  useEffect(() => { loadTransactions(); }, [page, search]);
  useEffect(() => {
    loadProducts();
    if (partyType) loadParties();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/transactions?type=${type}&page=${page}&limit=10&search=${search}`);
      setTransactions(data.data);
      setPagination(data.pagination);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const loadProducts = async () => {
    try {
      const data = await api.get('/products/all');
      setProducts(data.data);
    } catch (err) { console.error(err); }
  };

  const loadParties = async () => {
    try {
      const endpoint = partyType === 'supplier' ? '/suppliers/all' : '/customers/all';
      const data = await api.get(endpoint);
      setParties(data.data);
    } catch (err) { console.error(err); }
  };

  const openForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      partyId: '',
      items: [{ productId: '', quantity: 1, price: 0 }],
    });
    setShowForm(true);
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };

      // Auto-fill price when product is selected
      if (field === 'productId') {
        const product = products.find((p) => p.id === parseInt(value));
        if (product) {
          items[index].price =
            type === 'SALE' || type === 'OUTGOING'
              ? Number(product.sellPrice)
              : Number(product.buyPrice);
        }
      }

      return { ...prev, items };
    });
  };

  const getTotal = () => {
    return form.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleSave = async () => {
    const validItems = form.items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      addToast('Tambahkan minimal 1 item produk.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type,
        date: form.date,
        notes: form.notes,
        items: validItems.map((i) => ({
          productId: parseInt(i.productId),
          quantity: parseInt(i.quantity),
          price: parseFloat(i.price),
        })),
      };

      if (partyType === 'supplier' && form.partyId) payload.supplierId = parseInt(form.partyId);
      if (partyType === 'customer' && form.partyId) payload.customerId = parseInt(form.partyId);

      await api.post('/transactions', payload);
      addToast('Transaksi berhasil disimpan!', 'success');
      setShowForm(false);
      loadTransactions();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const viewDetail = async (t) => {
    try {
      const data = await api.get(`/transactions/${t.id}`);
      setDetailData(data.data);
      setShowDetail(true);
    } catch (err) { addToast(err.message, 'error'); }
  };

  const handleDelete = async (t) => {
    if (!confirm(`Hapus transaksi ${t.referenceNumber}? Stok akan dikembalikan.`)) return;
    try {
      await api.delete(`/transactions/${t.id}`);
      addToast('Transaksi dihapus & stok dikembalikan.', 'success');
      loadTransactions();
    } catch (err) { addToast(err.message, 'error'); }
  };

  const columns = [
    { key: 'no', label: 'No', render: (_, i) => (page - 1) * 10 + i + 1 },
    { key: 'referenceNumber', label: 'No. Referensi' },
    { key: 'date', label: 'Tanggal', render: (r) => new Date(r.date).toLocaleDateString('id-ID') },
    ...(partyType === 'supplier' ? [{ key: 'supplier', label: 'Supplier', render: (r) => r.supplier?.name || '-' }] : []),
    ...(partyType === 'customer' ? [{ key: 'customer', label: 'Customer', render: (r) => r.customer?.name || '-' }] : []),
    { key: 'items', label: 'Items', render: (r) => `${r.items?.length || 0} item` },
    { key: 'totalAmount', label: 'Total', cellStyle: { textAlign: 'right', fontWeight: 700 }, render: (r) => formatRupiah(r.totalAmount) },
    { key: 'user', label: 'User', render: (r) => r.user?.fullName || '-' },
    {
      key: 'actions', label: 'Aksi',
      render: (row) => (
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm" onClick={() => viewDetail(row)}>👁️</button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(row)} style={{ color: 'var(--danger)' }}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header title={`${icon} ${title}`} subtitle={`Input dan kelola ${title.toLowerCase()}`} />

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input placeholder="Cari no. referensi..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openForm}>+ Buat Transaksi</button>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={transactions} loading={loading} />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Transaction Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={`Buat ${title}`}
        size="xl"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Transaksi'}</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          {partyType && (
            <div className="form-group">
              <label className="form-label">{partyType === 'supplier' ? 'Supplier' : 'Customer'}</label>
              <select className="form-select" value={form.partyId} onChange={(e) => setForm({ ...form, partyId: e.target.value })}>
                <option value="">-- Pilih --</option>
                {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Catatan</label>
          <input className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan opsional..." />
        </div>

        <h4 style={{ marginBottom: '8px', marginTop: '16px' }}>Item Barang</h4>
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Produk</th>
              <th style={{ width: '15%' }}>Qty</th>
              <th style={{ width: '25%' }}>Harga</th>
              <th style={{ width: '15%' }}>Subtotal</th>
              <th style={{ width: '5%' }}></th>
            </tr>
          </thead>
          <tbody>
            {form.items.map((item, i) => (
              <tr key={i}>
                <td>
                  <select className="form-select" value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                    <option value="">Pilih produk</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.sku} - {p.name} (stok: {p.stock})</option>)}
                  </select>
                </td>
                <td><input className="form-input" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} /></td>
                <td><input className="form-input" type="number" value={item.price} onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)} /></td>
                <td style={{ fontWeight: 600, padding: '8px 12px' }}>{formatRupiah(item.quantity * item.price)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeItem(i)} style={{ color: 'var(--danger)' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginTop: '4px' }}>+ Tambah Item</button>

        <div className="items-total-row">
          <span style={{ color: 'var(--text-muted)' }}>Grand Total:</span>
          <span style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>{formatRupiah(getTotal())}</span>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Detail ${detailData?.referenceNumber || ''}`} size="lg">
        {detailData && (
          <div>
            <div className="form-row mb-2">
              <div><strong>Tanggal:</strong> {new Date(detailData.date).toLocaleDateString('id-ID')}</div>
              <div><strong>User:</strong> {detailData.user?.fullName}</div>
            </div>
            {detailData.supplier && <div className="mb-1"><strong>Supplier:</strong> {detailData.supplier.name}</div>}
            {detailData.customer && <div className="mb-1"><strong>Customer:</strong> {detailData.customer.name}</div>}
            {detailData.notes && <div className="mb-2"><strong>Catatan:</strong> {detailData.notes}</div>}

            <div className="table-container mt-2">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th><th>SKU</th><th>Produk</th><th>Qty</th><th style={{ textAlign: 'right' }}>Harga</th><th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detailData.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{item.product?.sku}</td>
                      <td>{item.product?.name}</td>
                      <td>{item.quantity} {item.product?.unit}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(item.price)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatRupiah(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="items-total-row">
              <span>Total:</span>
              <span style={{ color: 'var(--primary)' }}>{formatRupiah(detailData.totalAmount)}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

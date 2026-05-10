'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import api from '@/lib/api';

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await api.get('/reports/summary');
      setData(result.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Selamat datang di WMS Pro" />
        <div className="loading-container"><div className="spinner"></div></div>
      </>
    );
  }

  const maxChartValue = data?.chartData
    ? Math.max(...data.chartData.flatMap((d) => [d.sales, d.purchases]), 1)
    : 1;

  return (
    <>
      <Header title="Dashboard" subtitle="Overview gudang & transaksi Anda" />

      <div className="stats-grid slide-up">
        <div className="stat-card blue">
          <div className="stat-card-top">
            <div>
              <div className="stat-label">Total Produk</div>
              <div className="stat-value">{data?.totalProducts || 0}</div>
            </div>
            <div className="stat-icon blue">📦</div>
          </div>
          <div className="stat-change up">Total stok: {(data?.totalStock || 0).toLocaleString('id-ID')} unit</div>
        </div>

        <div className="stat-card green">
          <div className="stat-card-top">
            <div>
              <div className="stat-label">Penjualan Bulan Ini</div>
              <div className="stat-value">{formatRupiah(data?.monthlySales?.total)}</div>
            </div>
            <div className="stat-icon green">💰</div>
          </div>
          <div className="stat-change up">{data?.monthlySales?.count || 0} transaksi</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-card-top">
            <div>
              <div className="stat-label">Pembelian Bulan Ini</div>
              <div className="stat-value">{formatRupiah(data?.monthlyPurchases?.total)}</div>
            </div>
            <div className="stat-icon orange">🛒</div>
          </div>
          <div className="stat-change">{data?.monthlyPurchases?.count || 0} transaksi</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-top">
            <div>
              <div className="stat-label">Low Stock Alert</div>
              <div className="stat-value">{data?.lowStockCount || 0}</div>
            </div>
            <div className="stat-icon purple">⚠️</div>
          </div>
          <div className={`stat-change ${data?.lowStockCount > 0 ? 'down' : 'up'}`}>
            {data?.lowStockCount > 0 ? 'Perlu restok segera' : 'Semua stok aman'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        {/* Chart */}
        <div className="card slide-up">
          <div className="card-header">
            <h3 className="card-title">📈 Grafik Penjualan & Pembelian</h3>
            <span className="badge badge-blue">6 Bulan Terakhir</span>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {data?.chartData?.map((item, i) => (
                <div key={i} className="chart-bar-group">
                  <div className="chart-bar-wrapper">
                    <div
                      className="chart-bar sales"
                      style={{ height: `${Math.max((item.sales / maxChartValue) * 180, 4)}px` }}
                      title={`Penjualan: ${formatRupiah(item.sales)}`}
                    />
                    <div
                      className="chart-bar purchases"
                      style={{ height: `${Math.max((item.purchases / maxChartValue) * 180, 4)}px` }}
                      title={`Pembelian: ${formatRupiah(item.purchases)}`}
                    />
                  </div>
                  <div className="chart-bar-label">{item.month}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: 'var(--gradient-primary)' }} />
                Penjualan
              </div>
              <div className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: 'var(--gradient-success)' }} />
                Pembelian
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card slide-up">
          <div className="card-header">
            <h3 className="card-title">🕐 Transaksi Terbaru</h3>
            <span className="badge badge-green">{data?.todayTransactions || 0} hari ini</span>
          </div>
          {data?.recentTransactions?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.recentTransactions.map((t) => {
                const typeMap = {
                  INCOMING: { label: 'Masuk', badge: 'badge-blue', icon: '📥' },
                  OUTGOING: { label: 'Keluar', badge: 'badge-orange', icon: '📤' },
                  SALE: { label: 'Jual', badge: 'badge-green', icon: '💰' },
                  PURCHASE: { label: 'Beli', badge: 'badge-purple', icon: '🛒' },
                };
                const typeInfo = typeMap[t.type] || { label: t.type, badge: 'badge-blue', icon: '📋' };

                return (
                  <div key={t.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(15,23,42,0.3)',
                    border: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '20px' }}>{typeInfo.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.referenceNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {t.user?.fullName} • {new Date(t.date).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <span className={`badge ${typeInfo.badge}`}>{typeInfo.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">Belum ada transaksi</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

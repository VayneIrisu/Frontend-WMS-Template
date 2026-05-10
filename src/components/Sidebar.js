'use client';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { section: 'Menu' },
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { section: 'Master Data' },
  { href: '/dashboard/products', icon: '📦', label: 'Produk / Barang' },
  { href: '/dashboard/suppliers', icon: '🏭', label: 'Supplier' },
  { href: '/dashboard/customers', icon: '👥', label: 'Customer' },
  { section: 'Transaksi' },
  { href: '/dashboard/transactions/incoming', icon: '📥', label: 'Barang Masuk' },
  { href: '/dashboard/transactions/outgoing', icon: '📤', label: 'Barang Keluar' },
  { href: '/dashboard/transactions/sales', icon: '💰', label: 'Penjualan' },
  { href: '/dashboard/transactions/purchases', icon: '🛒', label: 'Pembelian' },
  { section: 'Laporan' },
  { href: '/dashboard/reports/mutation', icon: '🔄', label: 'Mutasi Barang' },
  { href: '/dashboard/reports/stock', icon: '📋', label: 'Cek Stok' },
  { href: '/dashboard/reports/cashflow', icon: '💹', label: 'Cashflow' },
  { section: 'Settings' },
  { href: '/dashboard/master/users', icon: '👤', label: 'Master User' },
  { href: '/dashboard/master/roles', icon: '🔐', label: 'Master Role' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🏬</div>
        <div>
          <h1>WMS Pro</h1>
          <span>Warehouse System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <div key={i} className="nav-section-title">{item.section}</div>;
          }

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={logout} title="Klik untuk logout">
          <div className="sidebar-user-avatar">
            {getInitials(user?.fullName)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
            <div className="sidebar-user-role">{user?.role?.name || 'Unknown'} • Logout</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

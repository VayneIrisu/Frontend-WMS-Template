import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/Toast';

export const metadata = {
  title: 'WMS Pro - Warehouse Management System',
  description: 'Sistem Manajemen Gudang modern untuk mengelola stok, transaksi, penjualan, dan pembelian',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

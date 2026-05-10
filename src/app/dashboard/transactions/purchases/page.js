'use client';
import TransactionPage from '@/components/TransactionPage';

export default function PurchasesPage() {
  return <TransactionPage type="PURCHASE" title="Pembelian" icon="🛒" partyType="supplier" />;
}

import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProperties } from '../../properties/slices/propertySlice';
import { fetchUnits } from '../../units/slices/unitSlice';
import { fetchTenants } from '../../tenants/slices/tenantSlice';
import { fetchPayments } from '../../payments/slices/paymentSlice';
import { fetchSettings } from '../../settings/slices/settingsSlice';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { Button } from '../../../components/Button';
import styles from './ReportsPage.module.css';

type RangeKey = 'all' | '30' | '90' | '365';

export default function ReportsPage() {
  const dispatch = useAppDispatch();
  const { properties } = useAppSelector(s => s.properties);
  const { units } = useAppSelector(s => s.units);
  const { tenants } = useAppSelector(s => s.tenants);
  const { payments } = useAppSelector(s => s.payments);
  const { data: settings } = useAppSelector(s => s.settings);

  const [range, setRange] = useState<RangeKey>('30');

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchUnits());
    dispatch(fetchTenants());
    dispatch(fetchPayments());
    dispatch(fetchSettings());
  }, [dispatch]);

  const filteredPayments = useMemo(() => {
    if (range === 'all') return payments;
    const cutoff = Date.now() - Number(range) * 24 * 60 * 60 * 1000;
    return payments.filter(p => p.payment_date >= cutoff);
  }, [payments, range]);

  const stats = useMemo(() => {
    const totalRevenue = filteredPayments.reduce((s, p) => s + p.amount_paid, 0);
    const totalBalance = filteredPayments.reduce((s, p) => s + p.balance, 0);
    const byType: { [key: string]: number } = {};
    filteredPayments.forEach(p => {
      byType[p.payment_type] = (byType[p.payment_type] || 0) + p.amount_paid;
    });

    // Per-property revenue
    const perProperty = properties.map(prop => {
      const propUnits = units.filter(u => u.property_id === prop.id).map(u => u.id);
      const rev = filteredPayments
        .filter(p => propUnits.includes(p.unit_id))
        .reduce((s, p) => s + p.amount_paid, 0);
      return { name: prop.name, revenue: rev };
    });

    return { totalRevenue, totalBalance, byType, perProperty };
  }, [filteredPayments, properties, units]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const rangeLabel = range === 'all' ? 'All Time' : `Last ${range} Days`;
    
    doc.setFontSize(20);
    doc.text(settings?.company_name || 'Rental Pro - Financial Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    if (settings?.phone) doc.text(`Phone: ${settings.phone}`, 14, 28);
    if (settings?.email) doc.text(`Email: ${settings.email}`, 14, 33);
    if (settings?.address) doc.text(`Address: ${settings.address}`, 14, 38);
    
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`Period: ${rangeLabel}`, 14, 48);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 54);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary', 14, 64);
    
    doc.setFontSize(10);
    doc.text(`Total Collected: KES ${stats.totalRevenue.toLocaleString()}`, 14, 70);
    doc.text(`Outstanding Balance: KES ${stats.totalBalance.toLocaleString()}`, 14, 76);
    doc.text(`Total Transactions: ${filteredPayments.length}`, 100, 70);
    doc.text(`Active Tenants: ${tenants.length}`, 100, 76);

    doc.setFontSize(14);
    doc.text('Collection by Property', 14, 86);
    
    const propData = stats.perProperty.map(p => [
      p.name, 
      `KES ${p.revenue.toLocaleString()}`
    ]);
    
    autoTable(doc, {
      startY: 90,
      head: [['Property', 'Revenue Collected']],
      body: propData,
      theme: 'grid',
      headStyles: { fillColor: [108, 99, 255] }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 72;
    
    doc.setFontSize(14);
    doc.text('Recent Transactions', 14, finalY + 10);

    const historyData = filteredPayments.map(p => {
      const tenantName = tenants.find(t => t.id === p.tenant_id)?.full_name || '—';
      const unitNum = units.find(u => u.id === p.unit_id)?.unit_number || '—';
      return [
        new Date(p.payment_date).toLocaleDateString(),
        tenantName,
        unitNum,
        p.payment_type,
        p.payment_method,
        `KES ${p.amount_paid.toLocaleString()}`
      ];
    });

    autoTable(doc, {
      startY: finalY + 14,
      head: [['Date', 'Tenant', 'Unit', 'Type', 'Method', 'Amount']],
      body: historyData,
      theme: 'grid',
      headStyles: { fillColor: [108, 99, 255] }
    });

    const fileName = `rental-pro-report-${new Date().getTime()}.pdf`;

    import('@capacitor/core').then(({ Capacitor }) => {
      if (Capacitor.isNativePlatform()) {
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        import('@capacitor/filesystem').then(({ Filesystem, Directory }) => {
          Filesystem.writeFile({
            path: fileName,
            data: pdfBase64,
            directory: Directory.Cache
          }).then(savedFile => {
            import('@capacitor/share').then(({ Share }) => {
              Share.share({
                title: 'Financial Report',
                url: savedFile.uri,
                dialogTitle: 'Share or Save PDF Report'
              });
            });
          }).catch(e => {
            console.error('Error saving PDF', e);
            alert('Failed to save PDF on mobile.');
          });
        });
      } else {
        doc.save(fileName);
      }
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Reports & Analytics</h1>
          <p className="text-muted">View revenue, balances, and collection summaries.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.rangeSelector}>
            {(['30', '90', '365', 'all'] as RangeKey[]).map(r => (
              <button
                key={r}
                className={`${styles.rangeBtn} ${range === r ? styles.active : ''}`}
                onClick={() => setRange(r)}
              >
                {r === 'all' ? 'All Time' : `Last ${r}d`}
              </button>
            ))}
          </div>
          <Button onClick={handleExportPDF}>
            <Download size={18} />
            <span>Export PDF</span>
          </Button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Collected</span>
          <span className={styles.summaryValue} style={{ color: 'var(--color-success)' }}>
            KES {stats.totalRevenue.toLocaleString()}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Outstanding Balance</span>
          <span className={styles.summaryValue} style={{ color: 'var(--color-danger)' }}>
            KES {stats.totalBalance.toLocaleString()}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Transactions</span>
          <span className={styles.summaryValue}>{filteredPayments.length}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Active Tenants</span>
          <span className={styles.summaryValue}>{tenants.length}</span>
        </div>
      </div>

      {/* Per-Property Revenue Chart */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Revenue by Property</h3>
        {stats.perProperty.length > 0 && stats.totalRevenue > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.perProperty} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-main)'
                }}
                formatter={(val: number) => [`KES ${val.toLocaleString()}`, 'Revenue']}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.emptyChart}>
            <p className="text-muted">No payment data for this period.</p>
          </div>
        )}
      </div>

      {/* Payment Breakdown Table */}
      <div className={styles.tableCard}>
        <h3 className={styles.chartTitle}>Collection by Payment Type</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Payment Type</th>
                <th>Total Collected (KES)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(stats.byType).length === 0 ? (
                <tr><td colSpan={2} className="text-muted" style={{ padding: 'var(--spacing-4)' }}>No payments in this period.</td></tr>
              ) : (
                Object.entries(stats.byType).map(([type, total]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    <td className={styles.amount}>{total.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Payment History Table */}
      <div className={styles.tableCard}>
        <h3 className={styles.chartTitle}>Payment History</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr><td colSpan={7} className="text-muted" style={{ padding: 'var(--spacing-4)' }}>No payments in this period.</td></tr>
              ) : (
                filteredPayments.map(p => {
                  const tenantName = tenants.find(t => t.id === p.tenant_id)?.full_name || '—';
                  const unitNum = units.find(u => u.id === p.unit_id)?.unit_number || '—';
                  return (
                    <tr key={p.id}>
                      <td className="text-muted">{new Date(p.payment_date).toLocaleDateString()}</td>
                      <td className={styles.bold}>{tenantName}</td>
                      <td>{unitNum}</td>
                      <td>{p.payment_type}</td>
                      <td>{p.payment_method}</td>
                      <td className={styles.amount}>KES {p.amount_paid.toLocaleString()}</td>
                      <td className={p.balance > 0 ? styles.danger : ''}>
                        KES {p.balance.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

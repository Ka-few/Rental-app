import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProperties } from '../../properties/slices/propertySlice';
import { fetchUnits } from '../../units/slices/unitSlice';
import { fetchTenants } from '../../tenants/slices/tenantSlice';
import { fetchPayments } from '../../payments/slices/paymentSlice';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import styles from './DashboardPage.module.css';

const COLORS = ['#6C63FF', '#1ECC8D', '#F5A623', '#E74C3C'];

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, color, icon }) => (
  <div className={styles.kpiCard} style={{ borderTopColor: color }}>
    <div className={styles.kpiIcon} style={{ background: `${color}22`, color }}>{icon}</div>
    <div className={styles.kpiContent}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{value}</span>
      {sub && <span className={styles.kpiSub}>{sub}</span>}
    </div>
  </div>
);

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { properties } = useAppSelector(s => s.properties);
  const { units } = useAppSelector(s => s.units);
  const { tenants } = useAppSelector(s => s.tenants);
  const { payments } = useAppSelector(s => s.payments);

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchUnits());
    dispatch(fetchTenants());
    dispatch(fetchPayments());
  }, [dispatch]);

  const stats = useMemo(() => {
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
    const vacantUnits = units.filter(u => u.status === 'Vacant').length;
    const maintenanceUnits = units.filter(u => u.status === 'Under Maintenance').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount_paid, 0);
    const totalBalance = payments.reduce((sum, p) => sum + p.balance, 0);

    // Monthly revenue for current year
    const monthlyData: { [key: string]: number } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthNames.forEach(m => { monthlyData[m] = 0; });
    const currentYear = new Date().getFullYear();
    payments.forEach(p => {
      const d = new Date(p.payment_date);
      if (d.getFullYear() === currentYear) {
        const month = monthNames[d.getMonth()];
        monthlyData[month] = (monthlyData[month] || 0) + p.amount_paid;
      }
    });
    const revenueChart = monthNames.map(m => ({ month: m, revenue: monthlyData[m] }));

    // Unit status breakdown for pie
    const statusData = [
      { name: 'Occupied', value: occupiedUnits },
      { name: 'Vacant', value: vacantUnits },
      { name: 'Reserved', value: units.filter(u => u.status === 'Reserved').length },
      { name: 'Maintenance', value: maintenanceUnits },
    ].filter(d => d.value > 0);

    return { totalUnits, occupiedUnits, vacantUnits, occupancyRate, totalRevenue, totalBalance, revenueChart, statusData };
  }, [units, payments]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className="text-muted">Welcome back. Here's your property overview.</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <KpiCard
          label="Total Properties"
          value={properties.length}
          sub={`${units.length} units total`}
          color="#6C63FF"
          icon={<span style={{ fontSize: '1.5rem' }}>🏢</span>}
        />
        <KpiCard
          label="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          sub={`${stats.occupiedUnits} / ${stats.totalUnits} occupied`}
          color="#1ECC8D"
          icon={<span style={{ fontSize: '1.5rem' }}>🔑</span>}
        />
        <KpiCard
          label="Total Revenue"
          value={`KES ${stats.totalRevenue.toLocaleString()}`}
          sub="All time"
          color="#F5A623"
          icon={<span style={{ fontSize: '1.5rem' }}>💰</span>}
        />
        <KpiCard
          label="Outstanding Balance"
          value={`KES ${stats.totalBalance.toLocaleString()}`}
          sub={`${tenants.length} tenants`}
          color="#E74C3C"
          icon={<span style={{ fontSize: '1.5rem' }}>📋</span>}
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Monthly Revenue Bar Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Monthly Revenue ({new Date().getFullYear()})</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.revenueChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
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
              <Bar dataKey="revenue" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Unit Status Pie Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Unit Status Breakdown</h3>
          {stats.statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-main)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', color: 'var(--color-text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyChart}>
              <p className="text-muted">No unit data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Vacancy Table */}
      <div className={styles.tableCard}>
        <h3 className={styles.chartTitle}>Vacant Units</h3>
        {stats.vacantUnits === 0 ? (
          <p className="text-muted" style={{ padding: 'var(--spacing-4)' }}>All units are currently occupied! 🎉</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>Property</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {units
                  .filter(u => u.status === 'Vacant' || u.status === 'Reserved')
                  .map(unit => {
                    const propName = properties.find(p => p.id === unit.property_id)?.name || '—';
                    return (
                      <tr key={unit.id}>
                        <td className={styles.bold}>{unit.unit_number}</td>
                        <td>{unit.unit_type}</td>
                        <td>{propName}</td>
                        <td className={styles.amount}>KES {unit.monthly_rent.toLocaleString()}</td>
                        <td>
                          <span className={`${styles.badge} ${unit.status === 'Vacant' ? styles.vacant : styles.reserved}`}>
                            {unit.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Payments Table */}
      <div className={styles.tableCard}>
        <h3 className={styles.chartTitle}>Recent Payments</h3>
        {payments.length === 0 ? (
          <p className="text-muted" style={{ padding: 'var(--spacing-4)' }}>No payments recorded yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 10).map(payment => {
                  const tenantName = tenants.find(t => t.id === payment.tenant_id)?.full_name || '—';
                  const unitNum = units.find(u => u.id === payment.unit_id)?.unit_number || '—';
                  return (
                    <tr key={payment.id}>
                      <td className={styles.bold}>{tenantName}</td>
                      <td>{unitNum}</td>
                      <td>{payment.payment_type}</td>
                      <td className={styles.amount}>KES {payment.amount_paid.toLocaleString()}</td>
                      <td className={payment.balance > 0 ? styles.danger : ''}>
                        KES {payment.balance.toLocaleString()}
                      </td>
                      <td className="text-muted">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

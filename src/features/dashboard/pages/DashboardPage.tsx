import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProperties } from '../../properties/slices/propertySlice';
import { fetchUnits } from '../../units/slices/unitSlice';
import { fetchTenants, fetchAllocations } from '../../tenants/slices/tenantSlice';
import { fetchPayments } from '../../payments/slices/paymentSlice';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Building2, DoorOpen, Users, AlertCircle, TrendingUp, CheckCircle2,
  Clock, BadgeDollarSign, ArrowRight
} from 'lucide-react';
import styles from './DashboardPage.module.css';

const COLORS = ['#6C63FF', '#1ECC8D', '#F5A623', '#E74C3C'];

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: React.ReactNode;
  alert?: boolean;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, color, icon, alert, onClick }) => (
  <div
    className={`${styles.kpiCard} ${alert ? styles.kpiAlert : ''} ${onClick ? styles.clickable : ''}`}
    style={{ borderTopColor: color }}
    onClick={onClick}
  >
    <div className={styles.kpiIcon} style={{ background: `${color}22`, color }}>{icon}</div>
    <div className={styles.kpiContent}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue} style={{ color: alert ? '#E74C3C' : undefined }}>{value}</span>
      {sub && <span className={styles.kpiSub}>{sub}</span>}
    </div>
    {onClick && <ArrowRight size={16} className={styles.kpiArrow} style={{ color }} />}
  </div>
);

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { properties } = useAppSelector(s => s.properties);
  const { units } = useAppSelector(s => s.units);
  const { tenants, allocations } = useAppSelector(s => s.tenants);
  const { payments } = useAppSelector(s => s.payments);

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchUnits());
    dispatch(fetchTenants());
    dispatch(fetchAllocations());
    dispatch(fetchPayments());
  }, [dispatch]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Unit stats
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'Occupied').length;
    const vacantUnits = units.filter(u => u.status === 'Vacant').length;
    const maintenanceUnits = units.filter(u => u.status === 'Under Maintenance').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    // Active tenants
    const activeTenants = tenants.filter(t => (t as any).status !== 'Inactive').length;

    // Rent due this month — sum of monthly_rent for all occupied units
    const occupiedUnitIds = units.filter(u => u.status === 'Occupied').map(u => u.id);
    const rentDueThisMonth = units
      .filter(u => u.status === 'Occupied')
      .reduce((sum, u) => sum + u.monthly_rent, 0);

    // Payments collected this month
    const thisMonthPayments = payments.filter(p => {
      const d = new Date(p.payment_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const collectedThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount_paid, 0);

    // Overdue: tenants with outstanding balance (balance > 0) from previous months
    const prevMonthCutoff = new Date(currentYear, currentMonth, 1).getTime();
    const overduePayments = payments.filter(p => p.balance > 0 && p.payment_date < prevMonthCutoff);
    const overdueCount = new Set(overduePayments.map(p => p.tenant_id)).size;
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.balance, 0);

    // Total outstanding balance
    const totalBalance = payments.reduce((sum, p) => sum + p.balance, 0);
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount_paid, 0);

    // Monthly revenue for current year chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: { [key: string]: number } = {};
    monthNames.forEach(m => { monthlyData[m] = 0; });
    payments.forEach(p => {
      const d = new Date(p.payment_date);
      if (d.getFullYear() === currentYear) {
        const month = monthNames[d.getMonth()];
        monthlyData[month] = (monthlyData[month] || 0) + p.amount_paid;
      }
    });
    const revenueChart = monthNames.map(m => ({ month: m, revenue: monthlyData[m] }));

    // Unit status pie
    const statusData = [
      { name: 'Occupied', value: occupiedUnits },
      { name: 'Vacant', value: vacantUnits },
      { name: 'Reserved', value: units.filter(u => u.status === 'Reserved').length },
      { name: 'Maintenance', value: maintenanceUnits },
    ].filter(d => d.value > 0);

    // Vacant unit details
    const vacantUnitList = units.filter(u => u.status === 'Vacant' || u.status === 'Reserved');

    // Overdue tenant details
    const overduetenantIds = new Set(overduePayments.map(p => p.tenant_id));
    const overdueDetails = tenants
      .filter(t => overduetenantIds.has(t.id))
      .map(t => {
        const balance = overduePayments
          .filter(p => p.tenant_id === t.id)
          .reduce((sum, p) => sum + p.balance, 0);
        const unit = units.find(u => u.id === overduePayments.find(p => p.tenant_id === t.id)?.unit_id);
        return { ...t, balance, unitNumber: unit?.unit_number || '—' };
      });

    // Recent payments (last 8)
    const recentPayments = [...payments]
      .sort((a, b) => b.payment_date - a.payment_date)
      .slice(0, 8);

    return {
      totalUnits, occupiedUnits, vacantUnits, maintenanceUnits, occupancyRate,
      activeTenants, rentDueThisMonth, collectedThisMonth, overdueCount, overdueAmount,
      totalBalance, totalRevenue, revenueChart, statusData, vacantUnitList,
      overdueDetails, recentPayments, thisMonthPayments
    };
  }, [units, payments, tenants, allocations]);

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className="text-muted">Welcome back — here's your property overview for {monthName}.</p>
        </div>
      </header>

      {/* KPI Cards Row 1 — Core metrics */}
      <div className={styles.kpiGrid}>
        <KpiCard
          label="Total Properties"
          value={properties.length}
          sub={`${stats.totalUnits} units total`}
          color="#6C63FF"
          icon={<Building2 size={22} />}
          onClick={() => navigate('/properties')}
        />
        <KpiCard
          label="Vacant Units"
          value={stats.vacantUnits}
          sub={`${stats.occupancyRate}% occupancy rate`}
          color={stats.vacantUnits > 0 ? '#F5A623' : '#1ECC8D'}
          icon={<DoorOpen size={22} />}
          alert={stats.vacantUnits > 0}
          onClick={() => navigate('/units')}
        />
        <KpiCard
          label="Active Tenants"
          value={stats.activeTenants}
          sub={`of ${tenants.length} registered`}
          color="#1ECC8D"
          icon={<Users size={22} />}
          onClick={() => navigate('/tenants')}
        />
        <KpiCard
          label="Overdue Accounts"
          value={stats.overdueCount}
          sub={stats.overdueCount > 0 ? `KES ${stats.overdueAmount.toLocaleString()} outstanding` : 'No overdue accounts'}
          color={stats.overdueCount > 0 ? '#E74C3C' : '#1ECC8D'}
          icon={<AlertCircle size={22} />}
          alert={stats.overdueCount > 0}
        />
      </div>

      {/* KPI Cards Row 2 — Financial this month */}
      <div className={styles.kpiGrid}>
        <KpiCard
          label={`Rent Due — ${monthName}`}
          value={`KES ${stats.rentDueThisMonth.toLocaleString()}`}
          sub={`From ${stats.occupiedUnits} occupied units`}
          color="#6C63FF"
          icon={<BadgeDollarSign size={22} />}
        />
        <KpiCard
          label={`Collected — ${monthName}`}
          value={`KES ${stats.collectedThisMonth.toLocaleString()}`}
          sub={`${stats.thisMonthPayments.length} transactions`}
          color="#1ECC8D"
          icon={<CheckCircle2 size={22} />}
          onClick={() => navigate('/payments')}
        />
        <KpiCard
          label="Total Outstanding"
          value={`KES ${stats.totalBalance.toLocaleString()}`}
          sub="All time unpaid balances"
          color={stats.totalBalance > 0 ? '#E74C3C' : '#1ECC8D'}
          icon={<Clock size={22} />}
          alert={stats.totalBalance > 0}
        />
        <KpiCard
          label="Total Revenue"
          value={`KES ${stats.totalRevenue.toLocaleString()}`}
          sub="All time collected"
          color="#F5A623"
          icon={<TrendingUp size={22} />}
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
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

      {/* Overdue Accounts */}
      {stats.overdueDetails.length > 0 && (
        <div className={`${styles.tableCard} ${styles.alertCard}`}>
          <h3 className={styles.chartTitle}>
            <span style={{ color: '#E74C3C' }}>⚠️ Overdue Accounts ({stats.overdueCount})</span>
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Overdue Balance</th>
                </tr>
              </thead>
              <tbody>
                {stats.overdueDetails.map(t => (
                  <tr key={t.id}>
                    <td className={styles.bold}>{t.full_name}</td>
                    <td>{t.unitNumber}</td>
                    <td className={styles.danger}>KES {t.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vacant Units */}
      <div className={styles.tableCard}>
        <h3 className={styles.chartTitle}>
          Vacant Units
          {stats.vacantUnits > 0 && (
            <span className={styles.badgeCount}>{stats.vacantUnits}</span>
          )}
        </h3>
        {stats.vacantUnitList.length === 0 ? (
          <p className="text-muted" style={{ padding: 'var(--spacing-4)' }}>🎉 All units are currently occupied!</p>
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
                {stats.vacantUnitList.map(unit => {
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

      {/* Recent Payments */}
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
                {stats.recentPayments.map(payment => {
                  const tenantName = tenants.find(t => t.id === payment.tenant_id)?.full_name || '—';
                  const unitNum = units.find(u => u.id === payment.unit_id)?.unit_number || '—';
                  return (
                    <tr key={payment.id}>
                      <td className={styles.bold}>{tenantName}</td>
                      <td>{unitNum}</td>
                      <td>{payment.payment_type}</td>
                      <td className={styles.amount}>KES {payment.amount_paid.toLocaleString()}</td>
                      <td className={payment.balance > 0 ? styles.danger : styles.clear}>
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

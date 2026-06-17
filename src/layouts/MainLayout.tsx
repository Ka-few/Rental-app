import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Building, DoorOpen, Users, Banknote, BarChart3, Settings } from 'lucide-react';
import styles from './MainLayout.module.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={24} /> },
  { path: '/properties', label: 'Properties', icon: <Building size={24} /> },
  { path: '/units', label: 'Units', icon: <DoorOpen size={24} /> },
  { path: '/tenants', label: 'Tenants', icon: <Users size={24} /> },
  { path: '/payments', label: 'Payments', icon: <Banknote size={24} /> },
  { path: '/reports', label: 'Reports', icon: <BarChart3 size={24} /> },
  { path: '/settings', label: 'Settings', icon: <Settings size={24} /> },
];

export default function MainLayout() {
  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar for Desktop/Tablet */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h2>Rental Pro</h2>
        </div>
        <nav className={styles.navMenu}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className={styles.bottomNav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.bottomNavItem} ${styles.active}` : styles.bottomNavItem
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

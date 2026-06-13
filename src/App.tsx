import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { dbService } from './db/sqlite';
import './index.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import PropertiesPage from './features/properties/pages/PropertiesPage';
import UnitsPage from './features/units/pages/UnitsPage';
import TenantsPage from './features/tenants/pages/TenantsPage';
import PaymentsPage from './features/payments/pages/PaymentsPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ReportsPage from './features/reports/pages/ReportsPage';

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      const success = await dbService.initializeDatabase();
      if (success) {
        setDbInitialized(true);
      } else {
        setDbError(true);
      }
    };
    initDb();
  }, []);

  if (dbError) {
    return (
      <div className="flex-center" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Failed to initialize local database.</h2>
      </div>
    );
  }

  if (!dbInitialized) {
    return (
      <div className="flex-center" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Loading App...</h2>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchSettings, saveSettings } from '../slices/settingsSlice';
import { Button } from '../../../components/Button';
import { Save } from 'lucide-react';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.settings);
  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      setFormData({
        company_name: data.company_name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(saveSettings(formData)).unwrap();
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className="text-muted">Configure company details for reports and exports.</p>
        </div>
      </header>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="company_name">Company / Landlord Name</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g. Prime Real Estate"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +254 700 000000"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. info@primerealestate.com"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Physical Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 123 Main St, Nairobi"
              className={styles.input}
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={loading}>
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

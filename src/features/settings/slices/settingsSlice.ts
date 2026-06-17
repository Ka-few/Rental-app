import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Settings } from '../types';
import { settingsApi } from '../api/settingsApi';

interface SettingsState {
  data: Settings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    const data = await settingsApi.getSettings();
    return data;
  }
);

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settingsData: Settings) => {
    const data = await settingsApi.updateSettings(settingsData);
    if (!data) throw new Error('Failed to save settings');
    return data;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      .addCase(saveSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save settings';
      });
  },
});

export default settingsSlice.reducer;

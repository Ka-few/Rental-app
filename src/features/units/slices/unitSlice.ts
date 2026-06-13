import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {  Unit, CreateUnitInput  } from "../types";
import { unitApi } from '../api/unitApi';

interface UnitState {
  units: Unit[];
  loading: boolean;
  error: string | null;
}

const initialState: UnitState = {
  units: [],
  loading: false,
  error: null,
};

export const fetchUnits = createAsyncThunk(
  'units/fetchUnits',
  async (propertyId?: string) => {
    const data = await unitApi.getUnits(propertyId);
    return data;
  }
);

export const addUnit = createAsyncThunk(
  'units/addUnit',
  async (unitData: CreateUnitInput) => {
    const data = await unitApi.addUnit(unitData);
    if (!data) throw new Error('Failed to add unit');
    return data;
  }
);

export const editUnit = createAsyncThunk(
  'units/editUnit',
  async ({ id, data }: { id: string; data: Partial<CreateUnitInput> }) => {
    const updatedData = await unitApi.updateUnit(id, data);
    if (!updatedData) throw new Error('Failed to update unit');
    return updatedData;
  }
);

export const removeUnit = createAsyncThunk(
  'units/removeUnit',
  async (id: string) => {
    const success = await unitApi.deleteUnit(id);
    if (!success) throw new Error('Failed to delete unit');
    return id;
  }
);

const unitSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch units';
      })
      .addCase(addUnit.fulfilled, (state, action) => {
        state.units.unshift(action.payload);
      })
      .addCase(editUnit.fulfilled, (state, action) => {
        const index = state.units.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.units[index] = action.payload;
        }
      })
      .addCase(removeUnit.fulfilled, (state, action) => {
        state.units = state.units.filter(u => u.id !== action.payload);
      });
  },
});

export default unitSlice.reducer;

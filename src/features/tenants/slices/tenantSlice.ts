import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {  Tenant, CreateTenantInput, TenantAllocation, CreateTenantAllocationInput  } from "../types";
import { tenantApi } from '../api/tenantApi';
import { fetchUnits } from '../../units/slices/unitSlice';

interface TenantState {
  tenants: Tenant[];
  allocations: TenantAllocation[];
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  tenants: [],
  allocations: [],
  loading: false,
  error: null,
};

export const fetchTenants = createAsyncThunk(
  'tenants/fetchTenants',
  async () => {
    const data = await tenantApi.getTenants();
    return data;
  }
);

export const addTenant = createAsyncThunk(
  'tenants/addTenant',
  async (tenantData: CreateTenantInput) => {
    const data = await tenantApi.addTenant(tenantData);
    if (!data) throw new Error('Failed to add tenant');
    return data;
  }
);

export const allocateTenant = createAsyncThunk(
  'tenants/allocateTenant',
  async (allocationData: CreateTenantAllocationInput, { dispatch }) => {
    const data = await tenantApi.allocateTenant(allocationData);
    if (!data) throw new Error('Failed to allocate tenant');
    
    // Refresh units so the UI reflects the unit's new "Occupied" status
    dispatch(fetchUnits());
    
    return data;
  }
);

export const editTenant = createAsyncThunk(
  'tenants/editTenant',
  async ({ id, data }: { id: string; data: Partial<CreateTenantInput> }) => {
    const updatedData = await tenantApi.updateTenant(id, data);
    if (!updatedData) throw new Error('Failed to update tenant');
    return updatedData;
  }
);

export const removeTenant = createAsyncThunk(
  'tenants/removeTenant',
  async (id: string) => {
    const success = await tenantApi.deleteTenant(id);
    if (!success) throw new Error('Failed to delete tenant');
    return id;
  }
);

const tenantSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tenants';
      })
      .addCase(addTenant.fulfilled, (state, action) => {
        state.tenants.unshift(action.payload);
      })
      .addCase(editTenant.fulfilled, (state, action) => {
        const index = state.tenants.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
      })
      .addCase(removeTenant.fulfilled, (state, action) => {
        state.tenants = state.tenants.filter(t => t.id !== action.payload);
      })
      .addCase(allocateTenant.fulfilled, (state, action) => {
        state.allocations.unshift(action.payload);
      });
  },
});

export default tenantSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {  Payment, CreatePaymentInput  } from "../types";
import { paymentApi } from '../api/paymentApi';

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
};

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (tenantId?: string) => {
    const data = await paymentApi.getPayments(tenantId);
    return data;
  }
);

export const addPayment = createAsyncThunk(
  'payments/addPayment',
  async (paymentData: CreatePaymentInput) => {
    const data = await paymentApi.addPayment(paymentData);
    if (!data) throw new Error('Failed to add payment');
    return data;
  }
);

export const editPayment = createAsyncThunk(
  'payments/editPayment',
  async ({ id, data }: { id: string; data: Partial<CreatePaymentInput> }) => {
    const updatedData = await paymentApi.updatePayment(id, data);
    if (!updatedData) throw new Error('Failed to update payment');
    return updatedData;
  }
);

export const removePayment = createAsyncThunk(
  'payments/removePayment',
  async (id: string) => {
    const success = await paymentApi.deletePayment(id);
    if (!success) throw new Error('Failed to delete payment');
    return id;
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payments';
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
      })
      .addCase(editPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(removePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(p => p.id !== action.payload);
      });
  },
});

export default paymentSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import propertyReducer from '../features/properties/slices/propertySlice';
import unitReducer from '../features/units/slices/unitSlice';
import tenantReducer from '../features/tenants/slices/tenantSlice';
import paymentReducer from '../features/payments/slices/paymentSlice';

export const store = configureStore({
  reducer: {
    properties: propertyReducer,
    units: unitReducer,
    tenants: tenantReducer,
    payments: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

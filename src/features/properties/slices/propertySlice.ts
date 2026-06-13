import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {  Property, CreatePropertyInput  } from "../types";
import { propertyApi } from '../api/propertyApi';

interface PropertyState {
  properties: Property[];
  loading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  properties: [],
  loading: false,
  error: null,
};

export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async () => {
    const data = await propertyApi.getProperties();
    return data;
  }
);

export const addProperty = createAsyncThunk(
  'properties/addProperty',
  async (propertyData: CreatePropertyInput) => {
    const data = await propertyApi.addProperty(propertyData);
    if (!data) throw new Error('Failed to add property');
    return data;
  }
);

export const editProperty = createAsyncThunk(
  'properties/editProperty',
  async ({ id, data }: { id: string; data: Partial<CreatePropertyInput> }) => {
    const updatedData = await propertyApi.updateProperty(id, data);
    if (!updatedData) throw new Error('Failed to update property');
    return updatedData;
  }
);

export const removeProperty = createAsyncThunk(
  'properties/removeProperty',
  async (id: string) => {
    const success = await propertyApi.deleteProperty(id);
    if (!success) throw new Error('Failed to delete property');
    return id;
  }
);

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch properties';
      })
      .addCase(addProperty.fulfilled, (state, action) => {
        state.properties.unshift(action.payload);
      })
      .addCase(editProperty.fulfilled, (state, action) => {
        const index = state.properties.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
      })
      .addCase(removeProperty.fulfilled, (state, action) => {
        state.properties = state.properties.filter(p => p.id !== action.payload);
      });
  },
});

export default propertySlice.reducer;

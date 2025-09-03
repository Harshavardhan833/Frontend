import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Get user and tokens from localStorage
const user = JSON.parse(localStorage.getItem('user'));
const accessToken = localStorage.getItem('accessToken');

const initialState = {
  user: user || null,
  accessToken: accessToken || null,
  isAuthenticated: !!accessToken,
  loading: false,
  error: null,
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // ✅ FIX: Added the "/api/" prefix to the URL
      const response = await api.post('/api/auth/login/', { email, password });
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'An error occurred during login.';
      return rejectWithValue(errorMsg);
    }
  }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
    'auth/logout', 
    async (_, { rejectWithValue }) => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            // ✅ FIX: Added the "/api/" prefix to the URL
            await api.post('/api/auth/logout/', { refresh: refreshToken });
        }
    } catch (err) {
        console.error("Logout API call failed, but logging out client-side anyway.", err.response?.data);
    } finally {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.isAuthenticated = true;
        state.user = action.payload.user; state.accessToken = action.payload.access;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false; state.isAuthenticated = false;
        state.user = null; state.accessToken = null; state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false; state.user = null;
        state.accessToken = null; state.error = null;
      });
  },
});

export const { setAccessToken } = authSlice.actions;
export default authSlice.reducer;

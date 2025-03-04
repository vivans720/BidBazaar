import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  user: null,
  error: null
};

// Create context
const AuthContext = createContext({
  state: initialState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loadUser: async () => {},
  updatePassword: async () => {},
  updateProfile: async () => {},
  clearErrors: () => {}
});

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'AUTH_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload);
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.type === 'LOGOUT' ? null : action.payload
      };
    case 'UPDATE_PASSWORD_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      };
    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null
      };
    case 'UPDATE_PASSWORD_FAIL':
    case 'UPDATE_PROFILE_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        console.log('Loading user data with token:', token);
        const res = await api.get('/users/me');
        console.log('User data loaded:', res.data);
        dispatch({ type: 'USER_LOADED', payload: res.data.data });
      } catch (err) {
        console.error('Error loading user:', err.response?.data || err);
        dispatch({ type: 'AUTH_ERROR' });
      }
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      console.log('Registering user with data:', userData);
      
      const res = await api.post('/auth/register', userData);
      console.log('Registration response:', res.data);
      
      if (res.data.success) {
        const token = res.data.token;
        setAuthToken(token);
        dispatch({ type: 'REGISTER_SUCCESS', payload: token });
        
        // Load user data immediately after successful registration
        try {
          const userRes = await api.get('/users/me');
          console.log('User data loaded after registration:', userRes.data);
          
          if (!userRes.data.data.role) {
            console.error('No role found in user data:', userRes.data);
            throw new Error('User role not found');
          }
          
          dispatch({ type: 'USER_LOADED', payload: userRes.data.data });
        } catch (userErr) {
          console.error('Error loading user after registration:', userErr.response?.data || userErr);
          dispatch({ type: 'AUTH_ERROR' });
          throw new Error('Failed to load user data after registration');
        }
      } else {
        throw new Error(res.data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      setAuthToken(null);
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.error || err.message || 'Registration failed'
      });
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      console.log('Attempting login with credentials:', credentials);
      
      const res = await api.post('/auth/login', credentials);
      console.log('Login response:', res.data);
      
      const token = res.data.token;
      setAuthToken(token);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: token });
      
      toast.success('Signed in successfully!');
      
      // Load user data immediately after successful login
      try {
        const userRes = await api.get('/users/me');
        console.log('User data loaded:', userRes.data);
        
        if (!userRes.data.data.role) {
          console.error('No role found in user data:', userRes.data);
          throw new Error('User role not found');
        }
        
        dispatch({ type: 'USER_LOADED', payload: userRes.data.data });
      } catch (userErr) {
        console.error('Error loading user:', userErr.response?.data || userErr);
        dispatch({ type: 'AUTH_ERROR' });
        toast.error('Error loading user data. Please try logging in again.');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err);
      setAuthToken(null);
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.error || 'Login failed'
      });
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      await api.put('/auth/updatepassword', passwordData);
      dispatch({ type: 'UPDATE_PASSWORD_SUCCESS' });
    } catch (err) {
      dispatch({
        type: 'UPDATE_PASSWORD_FAIL',
        payload: err.response?.data?.error || 'Password update failed'
      });
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      console.log('Updating profile with data:', profileData);
      dispatch({ type: 'AUTH_LOADING' });

      const res = await api.put('/users/updateprofile', profileData);
      console.log('Profile update response:', res.data);

      if (res.data.success) {
        dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: res.data.data });
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(res.data.error || 'Profile update failed');
      }
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.message || 'Profile update failed';
      dispatch({
        type: 'UPDATE_PROFILE_FAIL',
        payload: errorMessage
      });
      toast.error(errorMessage);
      throw err; // Re-throw to handle in component
    }
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // Effect to load user on mount and token changes
  useEffect(() => {
    console.log('AuthProvider mounted or token changed');
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        register,
        login,
        logout,
        loadUser,
        updatePassword,
        updateProfile,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
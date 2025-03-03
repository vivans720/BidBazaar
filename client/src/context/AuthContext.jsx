import React, { createContext, useReducer, useContext, useEffect } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
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
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user
  const loadUser = async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }

    try {
      const res = await axios.get('/api/users/me');
      dispatch({ type: 'USER_LOADED', payload: res.data.data });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data.token });
      loadUser();
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.error || 'Registration failed'
      });
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const res = await axios.post('/api/auth/login', credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.token });
      loadUser();
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.error || 'Login failed'
      });
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      await axios.put('/api/auth/updatepassword', passwordData);
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
      const res = await axios.put('/api/users/updateprofile', profileData);
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: res.data.data });
    } catch (err) {
      dispatch({
        type: 'UPDATE_PROFILE_FAIL',
        payload: err.response?.data?.error || 'Profile update failed'
      });
    }
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
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
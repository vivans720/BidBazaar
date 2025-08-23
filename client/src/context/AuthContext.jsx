import React, { createContext, useReducer, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

// Initial state
const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true, // Start with loading true to prevent flash
  user: null,
  error: null,
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
  clearErrors: () => {},
});

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "USER_LOADED":
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    case "AUTH_LOADING":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload);
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "AUTH_ERROR":
    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.type === "LOGOUT" ? null : action.payload,
      };
    case "UPDATE_PASSWORD_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
      };
    case "UPDATE_PROFILE_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null,
      };
    case "UPDATE_PASSWORD_FAIL":
    case "UPDATE_PROFILE_FAIL":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "CLEAR_ERRORS":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  };

  // Load user
  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        console.log("Loading user data with token:", token);
        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const res = await api.get("/users/me", {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log("User data loaded:", res.data);
        dispatch({ type: "USER_LOADED", payload: res.data.data });
      } catch (err) {
        console.error("Error loading user:", err.response?.data || err);
        dispatch({ type: "AUTH_ERROR" });
      }
    } else {
      // No token, immediately set loading to false
      dispatch({ type: "AUTH_ERROR" });
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      dispatch({
        type: "AUTH_LOADING",
      });

      const isFormData = formData instanceof FormData;
      let res;

      if (isFormData) {
        // For FormData, we need to remove the default Content-Type header
        // to let the browser set it with the boundary
        res = await api.post("/auth/register", formData, {
          headers: {
            "Content-Type": undefined,
          },
        });
      } else {
        res = await api.post("/auth/register", formData);
      }

      const token = res.data.token;
      setAuthToken(token);

      dispatch({ type: "REGISTER_SUCCESS", payload: token });

      // Load user data immediately after successful registration
      try {
        const userRes = await api.get("/users/me");
        console.log("User data loaded after registration:", userRes.data);
        dispatch({ type: "USER_LOADED", payload: userRes.data.data });
      } catch (userErr) {
        console.error(
          "Error loading user after registration:",
          userErr.response?.data || userErr
        );
        dispatch({ type: "AUTH_ERROR" });
      }
    } catch (error) {
      console.error("Register error:", error);
      setAuthToken(null);
      dispatch({
        type: "AUTH_ERROR",
        payload: error.response?.data?.error || "Registration failed",
      });
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      dispatch({ type: "AUTH_LOADING" });
      console.log("Attempting login with credentials:", credentials);

      const res = await api.post("/auth/login", credentials);
      console.log("Login response:", res.data);

      const token = res.data.token;
      setAuthToken(token);

      dispatch({ type: "LOGIN_SUCCESS", payload: token });

      toast.success("Signed in successfully!");

      // Load user data immediately after successful login
      try {
        const userRes = await api.get("/users/me");
        console.log("User data loaded:", userRes.data);

        if (!userRes.data.data.role) {
          console.error("No role found in user data:", userRes.data);
          throw new Error("User role not found");
        }

        dispatch({ type: "USER_LOADED", payload: userRes.data.data });
      } catch (userErr) {
        console.error("Error loading user:", userErr.response?.data || userErr);
        dispatch({ type: "AUTH_ERROR" });
        toast.error("Error loading user data. Please try logging in again.");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      setAuthToken(null);
      dispatch({
        type: "LOGIN_FAIL",
        payload: err.response?.data?.error || "Login failed",
      });
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: "LOGOUT" });
    toast.success("Signed out successfully");
    navigate("/"); // Navigate to home page after logout
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      await api.put("/auth/updatepassword", passwordData);
      dispatch({ type: "UPDATE_PASSWORD_SUCCESS" });
    } catch (err) {
      dispatch({
        type: "UPDATE_PASSWORD_FAIL",
        payload: err.response?.data?.error || "Password update failed",
      });
    }
  };

  // Update user profile
  const updateProfile = async (formData) => {
    try {
      dispatch({
        type: "AUTH_LOADING",
      });

      const isFormData = formData instanceof FormData;
      let res;

      if (isFormData) {
        // For FormData, we need to remove the default Content-Type header
        // to let the browser set it with the boundary
        res = await api.put("/users/updateprofile", formData, {
          headers: {
            "Content-Type": undefined,
          },
        });
      } else {
        res = await api.put("/users/updateprofile", formData);
      }

      dispatch({
        type: "UPDATE_PROFILE_SUCCESS",
        payload: res.data.data,
      });

      return res.data;
    } catch (error) {
      console.error("Update profile error:", error);
      dispatch({
        type: "UPDATE_PROFILE_FAIL",
        payload: error.response?.data?.error || "Failed to update profile",
      });
      throw error;
    }
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: "CLEAR_ERRORS" });
  };

  // Effect to load user on mount and token changes
  useEffect(() => {
    console.log("AuthProvider mounted or token changed");
    const token = localStorage.getItem("token");
    if (token) {
      loadUser();
    } else {
      // No token, set loading to false immediately
      dispatch({ type: "AUTH_ERROR" });
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
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Add these derived values for easier access in components
  return {
    ...context,
    user: context.state.user,
    isAuthenticated: context.state.isAuthenticated,
  };
};

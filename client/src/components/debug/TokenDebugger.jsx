import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const TokenDebugger = () => {
  const { state, user, isAuthenticated } = useAuth();
  const [tokenFromStorage, setTokenFromStorage] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check localStorage for token
    const token = localStorage.getItem('token');
    setTokenFromStorage(token);
  }, []);

  const testApiCall = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users/me');
      setApiResponse(response.data);
    } catch (err) {
      console.error('API test error:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Current Auth State</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Is Authenticated:</div>
          <div>{isAuthenticated ? 'Yes ✅' : 'No ❌'}</div>
          
          <div className="font-medium">User:</div>
          <div>{user ? `${user.name} (${user.email}) - Role: ${user.role}` : 'Not logged in'}</div>
          
          <div className="font-medium">Token in Context:</div>
          <div className="break-all">{state.token ? `${state.token.substring(0, 20)}...` : 'None'}</div>
          
          <div className="font-medium">Token in localStorage:</div>
          <div className="break-all">{tokenFromStorage ? `${tokenFromStorage.substring(0, 20)}...` : 'None'}</div>
        </div>
      </div>
      
      <div className="mb-6">
        <button 
          onClick={testApiCall}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Authentication'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <pre className="text-red-700 whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {apiResponse && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="text-lg font-medium text-green-800 mb-2">API Response</h3>
          <pre className="text-green-700 whitespace-pre-wrap overflow-auto max-h-60">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TokenDebugger; 
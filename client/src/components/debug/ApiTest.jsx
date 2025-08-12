import React, { useState } from "react";
import api from "../../utils/api";

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test auth debug endpoint
      const authDebugResponse = await api.get("/auth/debug");
      results.authDebug = {
        success: true,
        data: authDebugResponse.data,
      };
    } catch (error) {
      results.authDebug = {
        success: false,
        error: error.response?.data || error.message,
      };
    }

    try {
      // Test products endpoint
      const productsResponse = await api.get("/products");
      results.products = {
        success: true,
        count: productsResponse.data.count,
        firstProduct: productsResponse.data.data[0] || null,
      };
    } catch (error) {
      results.products = {
        success: false,
        error: error.response?.data || error.message,
      };
    }

    try {
      // Test bid stats endpoint
      const bidStatsResponse = await api.get("/bids/stats");
      results.bidStats = {
        success: true,
        data: bidStatsResponse.data,
      };
    } catch (error) {
      results.bidStats = {
        success: false,
        error: error.response?.data || error.message,
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">API Test Debug</h2>

        <button
          onClick={testEndpoints}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-4"
        >
          {loading ? "Testing..." : "Test API Endpoints"}
        </button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            {Object.entries(testResults).map(([endpoint, result]) => (
              <div key={endpoint} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 capitalize">
                  {endpoint} Endpoint
                </h3>
                <div
                  className={`p-3 rounded ${
                    result.success ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <p
                    className={`font-medium ${
                      result.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    Status: {result.success ? "Success" : "Failed"}
                  </p>
                  <pre className="mt-2 text-sm overflow-auto">
                    {JSON.stringify(
                      result.success ? result.data : result.error,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTest;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import ProductDetail from "../products/ProductDetail";
import SellerFeedbackDashboard from "../feedback/SellerFeedbackDashboard";
import RelistModal from "../products/RelistModal";
import { toast } from "react-toastify";

const VendorDashboard = () => {
  const { state } = useAuth();
  const { user } = state;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [relistModalOpen, setRelistModalOpen] = useState(false);
  const [selectedProductForRelist, setSelectedProductForRelist] = useState(null);

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const fetchVendorProducts = async () => {
    try {
      console.log("Fetching vendor products...");
      const res = await api.get("/products/vendor/products");
      console.log("Vendor products response:", res.data);
      setProducts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(
        "Error fetching vendor products:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.error || "Error fetching products");
      toast.error(err.response?.data?.error || "Error fetching products");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // If a product is selected, show its details
  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  const pendingProducts = products.filter((p) => p.status === "pending");
  const activeProducts = products.filter((p) => p.status === "active");
  // Only count products as completed sales if they have a winner
  const completedSales = products.filter((p) => p.winner);
  // Expired auctions are those that have ended but don't have a winner
  const expiredAuctions = products.filter(
    (p) => p.status === "ended" && !p.winner
  );

  // Filter products based on the active tab
  // Sort by latest endTime (or createdAt) descending
  const sortedProducts = [...products].sort((a, b) => {
    const aTime = new Date(a.endTime || a.createdAt).getTime();
    const bTime = new Date(b.endTime || b.createdAt).getTime();
    return bTime - aTime;
  });

  const filteredProducts =
    activeTab === "overview" || activeTab === "feedback"
      ? sortedProducts
      : activeTab === "active"
      ? [...activeProducts].sort((a, b) =>
          new Date(b.endTime || b.createdAt) - new Date(a.endTime || a.createdAt)
        )
      : activeTab === "pending"
      ? [...pendingProducts].sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )
      : activeTab === "completed"
      ? [...completedSales].sort((a, b) =>
          new Date(b.endTime || b.createdAt) - new Date(a.endTime || a.createdAt)
        )
      : expiredAuctions;

  // Calculate total earnings from completed sales
  const totalEarnings = completedSales.reduce(
    (total, product) => total + product.currentPrice,
    0
  );

  const handleRelist = (product) => {
    setSelectedProductForRelist(product);
    setRelistModalOpen(true);
  };

  const handleRemove = async (product) => {
    if (!window.confirm(`Are you sure you want to remove "${product.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/products/${product._id}/remove`);
      toast.success('Product removed successfully');
      fetchVendorProducts(); // Refresh the list
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error(error.response?.data?.error || 'Failed to remove product');
    }
  };

  const handleRelistSuccess = (relistedProduct) => {
    fetchVendorProducts(); // Refresh the list
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Vendor Dashboard</h2>
            <p className="mt-1 text-primary-100">
              Welcome back, {user?.name}! Here's what's happening with your
              products.
            </p>
          </div>
          <Link
            to="/products/create"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-white text-primary-700 hover:bg-primary-50 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="-ml-1 mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create New Listing
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Listings Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Active Listings</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {activeProducts.length}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => setActiveTab("active")}
                className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
              >
                View listings →
              </button>
            </div>
          </div>

          {/* Pending Approval Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Pending Approval</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {pendingProducts.length}
                </h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => setActiveTab("pending")}
                className="text-sm font-medium text-yellow-600 hover:text-yellow-800 transition-colors"
              >
                View pending →
              </button>
            </div>
          </div>

          {/* Completed Sales Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Completed Sales</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {completedSales.length}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  ₹{totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => setActiveTab("completed")}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View completed →
              </button>
            </div>
          </div>

          {/* Expired Auctions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Expired Auctions</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {expiredAuctions.length}
                </h3>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => setActiveTab("expired")}
                className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                View expired →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Section */}
      <div className="px-6 pb-8">
        <div className="border-t border-gray-200 pt-6">
          {/* Filter Tabs */}
          <div className="flex overflow-x-auto pb-3 space-x-4 border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === "overview"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === "feedback"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Customer Feedback
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === "active"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === "pending"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === "completed"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab("expired")}
              className={`pb-2 px-1 text-sm font-medium ${
                activeTab === "expired"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Expired
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="mt-6">
            {activeTab === "feedback" ? (
              <SellerFeedbackDashboard sellerId={user?.id} />
            ) : (
              <>
                {/* Helpful message for unsold products */}
                {activeTab === "overview" && expiredAuctions.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          You have {expiredAuctions.length} unsold product{expiredAuctions.length > 1 ? 's' : ''}
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Consider relisting with a lower starting price to attract more bidders. 
                            Our system will provide price recommendations based on previous auction data.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Listings */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      No {activeTab} listings found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {activeTab === "overview"
                        ? "You haven't created any listings yet."
                        : `You don't have any ${activeTab} listings at the moment.`}
                    </p>
                    {activeTab === "overview" && (
                      <Link
                        to="/products/create"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Create your first listing
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto shadow-sm rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            End Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Buyer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                          <tr
                            key={product._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                                  <img
                                    className="h-12 w-12 object-cover"
                                    src={
                                      product.images?.[0]?.url ||
                                      "/placeholder-product.png"
                                    }
                                    alt={product.title}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/placeholder-product.png";
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <button
                                    onClick={() => setSelectedProduct(product)}
                                    className="text-sm font-medium text-gray-900 hover:text-primary-600"
                                  >
                                    {product.title}
                                  </button>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {product.category}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${
                                  product.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : product.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : product.status === "ended" &&
                                      product.winner
                                    ? "bg-blue-100 text-blue-800"
                                    : product.status === "ended"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {product.status === "ended" && product.winner
                                  ? "Sold"
                                  : product.status === "ended"
                                  ? "Unsold"
                                  : product.status.charAt(0).toUpperCase() +
                                    product.status.slice(1)}
                              </span>
                              {product.status === "ended" && !product.winner && (
                                <div className="text-xs text-red-600 mt-1">
                                  No bids received
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ₹{product.currentPrice.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Started at: ₹
                                {product.startingPrice.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(product.endTime).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(product.endTime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.winner ? (
                                <div className="flex flex-col">
                                  <span className="text-green-600 font-medium">
                                    {product.winner.name}
                                  </span>
                                  {product.winner.email && (
                                    <span className="text-xs text-gray-500">
                                      {product.winner.email}
                                    </span>
                                  )}
                                </div>
                              ) : product.status === "ended" ? (
                                <span className="text-red-600 text-sm">
                                  No buyer
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="text-primary-600 hover:text-primary-900 mr-3"
                              >
                                View
                              </button>
                              {product.status === "active" ||
                              product.status === "pending" ? (
                                <Link
                                  to={`/products/edit/${product._id}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </Link>
                              ) : product.status === "ended" && !product.winner ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleRelist(product)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Relist
                                  </button>
                                  <button
                                    onClick={() => handleRemove(product)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Relist Modal */}
      <RelistModal
        product={selectedProductForRelist}
        isOpen={relistModalOpen}
        onClose={() => {
          setRelistModalOpen(false);
          setSelectedProductForRelist(null);
        }}
        onRelistSuccess={handleRelistSuccess}
      />
    </div>
  );
};

export default VendorDashboard;

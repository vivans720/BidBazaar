import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import ProductDetail from "../products/ProductDetail";
import { useAuth } from "../../context/AuthContext";
import BidStats from "./BidStats";
import {
  UserCircleIcon,
  TrashIcon,
  PencilIcon,
  KeyIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const { state } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    phone: "",
  });

  useEffect(() => {
    console.log("Auth State:", {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      loading: state.loading,
    });

    // Check if user is admin
    if (!state.user || state.user.role !== "admin") {
      const errorMsg = `Not authorized to access admin dashboard. Current role: ${state.user?.role}`;
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    fetchData();
  }, [activeTab, state.user]);

  // Filter users when search query changes
  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsRefreshing(true);

      if (activeTab === "users") {
        console.log("Fetching users...");
        const res = await api.get("/users");
        console.log("Users response:", res.data);
        setUsers(res.data.data);
        setFilteredUsers(res.data.data);
      } else {
        console.log("Fetching pending products...");
        const res = await api.get("/products?status=pending");
        console.log("Products response:", res.data);
        setProducts(res.data.data);
      }

      setLoading(false);
      setIsRefreshing(false);
    } catch (err) {
      console.error("Error fetching data:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to fetch data");
      toast.error(err.response?.data?.error || "Failed to fetch data");
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      setFilteredUsers(filteredUsers.filter((user) => user._id !== userId));
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleProductApproval = async (productId, status, remarks = "") => {
    try {
      console.log("Updating product status:", { productId, status, remarks });
      await api.put(`/products/${productId}/review`, {
        status,
        adminRemarks: remarks,
      });

      setProducts(products.filter((product) => product._id !== productId));
      setSelectedProduct(null);
      toast.success(
        `Product ${status === "active" ? "approved" : "rejected"} successfully`
      );
    } catch (err) {
      console.error(
        "Error updating product status:",
        err.response?.data || err.message
      );
      toast.error(
        err.response?.data?.error || "Failed to update product status"
      );
    }
  };

  // Get role badge color
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "vendor":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-blue-100 text-blue-800 border border-blue-200";
    }
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate new user data
      if (!newUser.email || !newUser.password || !newUser.name) {
        toast.error("Name, email, and password are required");
        setError("Name, email, and password are required");
        setLoading(false);
        return;
      }

      // Create new user
      const res = await api.post("/users", newUser);
      console.log("User created response:", res.data);

      if (res.data.success) {
        // Add the new user to the users list with the data from the response
        const createdUser = res.data.data;
        setUsers([...users, createdUser]);
        setFilteredUsers([...filteredUsers, createdUser]);

        // Clear the form and close the modal
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "buyer",
          phone: "",
        });

        setShowAddUserModal(false);
        toast.success("User added successfully");
      } else {
        throw new Error(res.data.error || "Failed to add user");
      }
    } catch (err) {
      console.error("Error adding user:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.error || err.message || "Failed to add user"
      );
      setError(
        err.response?.data?.error || err.message || "Failed to add user"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-700 font-medium">
          Loading dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // If a product is selected, show its details
  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onApprove={(id) => handleProductApproval(id, "active")}
        onReject={(id, remarks) =>
          handleProductApproval(id, "rejected", remarks)
        }
        isAdmin={true}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("stats")}
            className={`${
              activeTab === "stats"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Platform Statistics
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`${
              activeTab === "users"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Users Management
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`${
              activeTab === "products"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Product Approvals
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === "stats" ? (
          <div className="space-y-6">
            <BidStats />

            {/* Additional statistics sections can be added here */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className="bg-white border border-gray-300 rounded-md p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-md p-2 mr-3">
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Manage Users
                      </h4>
                      <p className="text-xs text-gray-500">
                        View and manage user accounts
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("products")}
                  className="bg-white border border-gray-300 rounded-md p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-md p-2 mr-3">
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
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Review Products
                      </h4>
                      <p className="text-xs text-gray-500">
                        Approve or reject pending products
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === "users" ? (
          <div className="bg-white shadow-sm rounded-lg">
            {/* User Management Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
              <h2 className="text-xl font-semibold text-gray-800">
                User Management
              </h2>

              <div className="flex space-x-3">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search users..."
                    value={searchQuery || ""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchData}
                  disabled={isRefreshing}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 mr-1 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>

                {/* Add New User Button */}
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Add User
                </button>
              </div>
            </div>

            {/* User Cards */}
            <div className="p-6">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No users found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery
                      ? "Try a different search term"
                      : "There are no users to display"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-center mb-4">
                          {/* User Avatar */}
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden mr-4">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={`${user.name}'s avatar`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900 truncate">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>

                          {/* Role Badge */}
                          <span
                            className={`ml-2 px-2.5 py-1 text-xs font-medium rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : user.role === "vendor"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div className="col-span-2">
                            <span className="block text-xs text-gray-500">
                              Phone
                            </span>
                            <span className="font-medium text-gray-900">
                              {user.phone || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex space-x-2 justify-end">
                          <button
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Edit User"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Reset Password"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                              />
                            </svg>
                          </button>

                          {user.role !== "admin" && (
                            <button
                              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-gray-100 rounded-full transition-colors"
                              title="Make Admin"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Delete User"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Add New User
                  </h3>

                  {error && (
                    <div className="mb-4">
                      <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                        role="alert"
                      >
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter password"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Role
                      </label>
                      <select
                        id="role"
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="buyer">Buyer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Phone (optional)
                      </label>
                      <input
                        type="text"
                        id="phone"
                        value={newUser.phone}
                        onChange={(e) =>
                          setNewUser({ ...newUser, phone: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddUser}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                    >
                      {loading ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      ) : null}
                      Add User
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending products to review</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Vendor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
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
                              className="text-sm font-medium text-primary-600 hover:text-primary-900"
                            >
                              {product.title}
                            </button>
                            <div className="text-sm text-gray-500">
                              {product.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.vendor.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.startingPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() =>
                            handleProductApproval(product._id, "active")
                          }
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const remarks = prompt("Enter rejection remarks:");
                            if (remarks !== null) {
                              handleProductApproval(
                                product._id,
                                "rejected",
                                remarks
                              );
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

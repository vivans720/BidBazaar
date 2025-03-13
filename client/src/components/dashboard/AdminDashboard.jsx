import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import ProductDetail from '../products/ProductDetail';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { state } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    console.log('Auth State:', {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      loading: state.loading
    });

    // Check if user is admin
    if (!state.user || state.user.role !== 'admin') {
      const errorMsg = `Not authorized to access admin dashboard. Current role: ${state.user?.role}`;
      console.error(errorMsg);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    fetchData();
  }, [activeTab, state.user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'users') {
        console.log('Fetching users...');
        const res = await api.get('/users');
        console.log('Users response:', res.data);
        setUsers(res.data.data);
      } else {
        console.log('Fetching pending products...');
        const res = await api.get('/products?status=pending');
        console.log('Products response:', res.data);
        setProducts(res.data.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to fetch data');
      toast.error(err.response?.data?.error || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleProductApproval = async (productId, status, remarks = '') => {
    try {
      console.log('Updating product status:', { productId, status, remarks });
      await api.put(`/products/${productId}/review`, {
        status,
        adminRemarks: remarks
      });
      
      setProducts(products.filter(product => product._id !== productId));
      setSelectedProduct(null);
      toast.success(`Product ${status === 'active' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error updating product status:', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Failed to update product status');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
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
        onApprove={(id) => handleProductApproval(id, 'active')}
        onReject={(id, remarks) => handleProductApproval(id, 'rejected', remarks)}
        isAdmin={true}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Users Management
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`${
              activeTab === 'products'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Product Approvals
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'users' ? (
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'vendor'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                              src={product.images?.[0]?.url || '/placeholder-product.png'}
                              alt={product.title}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-product.png';
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
                        <div className="text-sm text-gray-900">{product.vendor.name}</div>
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
                          onClick={() => handleProductApproval(product._id, 'active')}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const remarks = prompt('Enter rejection remarks:');
                            if (remarks !== null) {
                              handleProductApproval(product._id, 'rejected', remarks);
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
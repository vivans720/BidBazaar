import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const PasswordForm = () => {
  const { state, updatePassword } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const validateForm = () => {
    let valid = true;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
      valid = false;
    }
    
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
      valid = false;
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      valid = false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (validateForm()) {
      try {
        await updatePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        setMessage({ type: 'error', text: state.error || 'Failed to update password' });
      }
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-md mx-auto">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Change Password</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your account password</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-2 border-black rounded-md ${
                    formErrors.currentPassword ? 'border-red-300' : ''
                  }`}
                />
                {formErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.currentPassword}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-2 border-black rounded-md ${
                    formErrors.newPassword ? 'border-red-300' : ''
                  }`}
                />
                {formErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-2 border-black rounded-md ${
                    formErrors.confirmPassword ? 'border-red-300' : ''
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={state.loading}
            >
              {state.loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordForm;
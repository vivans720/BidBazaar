import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  KeyIcon, 
  LockClosedIcon, 
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
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
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
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
    
    // Clear error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  const toggleShowPassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (validateForm()) {
      setLoading(true);
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
        setMessage({ type: 'error', text: state.error || 'Failed to update password. Please check your current password.' });
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Assess password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: 'None', color: 'bg-gray-200' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const strengthMap = [
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Fair', color: 'bg-orange-500' },
      { label: 'Good', color: 'bg-yellow-500' },
      { label: 'Strong', color: 'bg-green-500' },
      { label: 'Very Strong', color: 'bg-green-600' }
    ];
    
    return { 
      strength, 
      label: strengthMap[strength]?.label || 'Weak',
      color: strengthMap[strength]?.color || 'bg-red-500'
    };
  };
  
  const passwordStrength = getPasswordStrength(formData.newPassword);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
      </div>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-md flex items-start ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
          )}
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-primary-600 mr-2" />
              <p className="text-sm text-gray-600">
                Create a strong password to protect your account. We recommend using at least 8 characters, including numbers and special characters.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-10 block w-full border ${
                    formErrors.currentPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  } rounded-md shadow-sm py-2 text-sm transition-colors`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('current')}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword.current ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.currentPassword && (
                  <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {formErrors.currentPassword && (
                <p className="mt-2 text-sm text-red-600">{formErrors.currentPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-10 block w-full border ${
                    formErrors.newPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  } rounded-md shadow-sm py-2 text-sm transition-colors`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('new')}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword.new ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.newPassword && (
                  <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {formErrors.newPassword ? (
                <p className="mt-2 text-sm text-red-600">{formErrors.newPassword}</p>
              ) : (
                formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className={`h-2 rounded-full ${passwordStrength.color}`} 
                          style={{ width: `${(passwordStrength.strength + 1) * 20}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {passwordStrength.strength < 3 && "Try adding numbers, symbols, and mixed case letters for a stronger password."}
                    </p>
                  </div>
                )
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-10 block w-full border ${
                    formErrors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                  } rounded-md shadow-sm py-2 text-sm transition-colors`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => toggleShowPassword('confirm')}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword.confirm ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
                {!formErrors.confirmPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordForm;
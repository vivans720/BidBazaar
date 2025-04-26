import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  HomeIcon, 
  MapPinIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const ProfileForm = () => {
  const { state, updateProfile } = useAuth();
  const { user } = state;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isImageSubmitting, setIsImageSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        }
      });
      
      // Set profile image preview if exists
      if (user.profileImage) {
        setProfileImagePreview(user.profileImage);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Only accept image files
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileImage) {
      alert('Please select an image to upload');
      return;
    }
    
    setIsImageSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      const response = await fetch('/api/users/updateprofileimage', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update user in context
        alert('Profile image updated successfully');
        // Update the user context with new image URL
        user.profileImage = data.data.profileImage;
      } else {
        alert(data.error || 'Failed to update profile image');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('An error occurred while updating profile image');
    } finally {
      setIsImageSubmitting(false);
    }
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Transform the form data to match the expected API structure
      const profileData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          country: formData.address.country
        }
      };

      console.log('Submitting profile update:', profileData);
      await updateProfile(profileData);
      
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      });
      
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (field) => {
    return `mt-1 block w-full border ${
      touched[field] && !formData[field] && field !== 'phone' && field !== 'street' && field !== 'city' && field !== 'state' && field !== 'zipCode' && field !== 'country'
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
    } rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm transition-colors`;
  };

  const getIcon = (field) => {
    switch (field) {
      case 'name':
        return <UserIcon className="h-5 w-5 text-gray-400" />;
      case 'email':
        return <EnvelopeIcon className="h-5 w-5 text-gray-400" />;
      case 'phone':
        return <PhoneIcon className="h-5 w-5 text-gray-400" />;
      case 'street':
        return <HomeIcon className="h-5 w-5 text-gray-400" />;
      case 'city':
      case 'state':
      case 'zipCode':
        return <MapPinIcon className="h-5 w-5 text-gray-400" />;
      case 'country':
        return <GlobeAltIcon className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
      
      {/* Profile Image Section */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
            {profileImagePreview ? (
              <img 
                src={profileImagePreview} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Profile image preview load error:", profileImagePreview);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=User';
                }}
              />
            ) : user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("User profile image load error:", user.profileImage);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=User';
                }}
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          
          <div className="flex-1">
            <form onSubmit={handleImageSubmit} className="space-y-4">
              <div>
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  accept="image/*"
                />
                <p className="mt-1 text-xs text-gray-500">Max file size: 5MB. Supported formats: JPG, PNG, GIF</p>
              </div>
              
              <button
                type="submit"
                disabled={!profileImage || isImageSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {isImageSubmitting ? 'Uploading...' : 'Upload Image'}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('name')}
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-10 ${inputClasses('name')}`}
                    required
                  />
                  {touched.name && !formData.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.name && !formData.name && (
                  <p className="mt-2 text-sm text-red-600">Name is required</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('email')}
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-10 ${inputClasses('email')}`}
                    required
                  />
                  {touched.email && !formData.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.email && !formData.email && (
                  <p className="mt-2 text-sm text-red-600">Email is required</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('phone')}
                  </div>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-10 ${inputClasses('phone')}`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Optional</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('street')}
                  </div>
                  <input
                    type="text"
                    name="street"
                    id="street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={`pl-10 ${inputClasses('street')}`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Optional</p>
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('city')}
                  </div>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`pl-10 ${inputClasses('city')}`}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State/Province</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('state')}
                  </div>
                  <input
                    type="text"
                    name="state"
                    id="state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`pl-10 ${inputClasses('state')}`}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('zipCode')}
                  </div>
                  <input
                    type="text"
                    name="zipCode"
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className={`pl-10 ${inputClasses('zipCode')}`}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {getIcon('country')}
                  </div>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className={`pl-10 ${inputClasses('country')}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </button>
        </div>
        
        {message.text && (
          <div className={`mt-4 p-4 rounded-md flex items-start ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
            {message.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;
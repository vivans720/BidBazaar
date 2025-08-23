import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startingPrice: '',
    duration: '24',
    images: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    console.log('File input triggered');
    console.log('Input element:', e.target);
    console.log('Multiple attribute:', e.target.multiple);
    console.log('Files object:', e.target.files);
    
    const files = Array.from(e.target.files);
    console.log('Files selected:', files.length, files.map(f => f.name));
    
    // Limit to maximum 5 images
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed per product');
      return;
    }
    
    setSelectedFiles(files);
    
    // Create preview URLs for the selected files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      setSelectedFiles(files);
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
    }
  };

  const removeImage = (index) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    
    // Release the object URL to free memory
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const uploadImages = async (files) => {
    if (files.length === 0) {
      throw new Error('No files to upload');
    }

    // Use multiple upload endpoint for multiple files
    if (files.length > 1) {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      try {
        console.log(`Uploading ${files.length} images via multiple upload...`);
        const response = await api.post('/upload/multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Multiple upload response:', response.data);
        
        if (!response.data.images || !Array.isArray(response.data.images)) {
          throw new Error('Invalid response from upload service');
        }
        
        return response.data.images;
      } catch (err) {
        console.error('Error uploading multiple images:', {
          fileCount: files.length,
          error: err.response?.data || err.message
        });
        throw new Error(`Failed to upload images: ${err.response?.data?.error || err.message}`);
      }
    } else {
      // Single file upload for backward compatibility
      const formData = new FormData();
      formData.append('image', files[0]);
      
      try {
        console.log('Uploading single image:', files[0].name);
        const response = await api.post('/upload', formData);
        console.log('Single upload response:', response.data);
        
        if (!response.data.url) {
          throw new Error('No URL received from upload service');
        }
        
        return [{
          url: response.data.url,
          public_id: response.data.public_id
        }];
      } catch (err) {
        console.error('Error uploading single image:', {
          fileName: files[0].name,
          error: err.response?.data || err.message
        });
        throw new Error(`Failed to upload image ${files[0].name}: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  const validateForm = () => {
    return (
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.category !== '' &&
      formData.startingPrice > 0 &&
      formData.duration >= 1 &&
      formData.duration <= 168 &&
      selectedFiles.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setLoading(true);

    try {
      if (selectedFiles.length === 0) {
        throw new Error('Please select at least one image');
      }

      // Upload images first
      console.log('Starting image upload process...');
      const uploadedImages = await uploadImages(selectedFiles);
      console.log('Images uploaded successfully:', uploadedImages);

      const productData = {
        ...formData,
        images: uploadedImages
      };

      console.log('Creating product with data:', productData);
      await api.post('/products', productData);
      toast.success('Product listed successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating product:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Error creating product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Listing</h2>
              <p className="text-primary-100 mt-1">Create a new product to auction on BidBazaar</p>
            </div>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter product title"
                    className={`block w-full px-3 py-2 border ${submitAttempted && !formData.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  />
                  {submitAttempted && !formData.title && (
                    <p className="mt-1 text-sm text-red-600">Title is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    required
                    placeholder="Describe your product in detail"
                    className={`block w-full px-3 py-2 border ${submitAttempted && !formData.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  />
                  {submitAttempted && !formData.description && (
                    <p className="mt-1 text-sm text-red-600">Description is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={`block w-full px-3 py-2 border ${submitAttempted && !formData.category ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  >
                    <option value="">Select a category</option>
                    <option value="handicrafts">Handicrafts</option>
                    <option value="paintings">Paintings</option>
                    <option value="decor">Decor</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="furniture">Furniture</option>
                    <option value="electronics">Electronics</option>
                    <option value="collectibles">Collectibles</option>
                    <option value="clothing">Clothing</option>
                    <option value="other">Other</option>
                  </select>
                  {submitAttempted && !formData.category && (
                    <p className="mt-1 text-sm text-red-600">Category is required</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price (₹) <span className="text-red-500">*</span></label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        name="startingPrice"
                        value={formData.startingPrice}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-3 py-2 border ${submitAttempted && (!formData.startingPrice || formData.startingPrice <= 0) ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                      />
                    </div>
                    {submitAttempted && (!formData.startingPrice || formData.startingPrice <= 0) && (
                      <p className="mt-1 text-sm text-red-600">Starting price must be greater than 0</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="1"
                        max="168"
                        required
                        className={`block w-full px-3 py-2 border ${submitAttempted && (formData.duration < 1 || formData.duration > 168) ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Min: 1 hour, Max: 7 days (168 hours)</p>
                    {submitAttempted && (formData.duration < 1 || formData.duration > 168) && (
                      <p className="mt-1 text-sm text-red-600">Duration must be between 1 and 168 hours</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Images <span className="text-red-500">*</span></label>
                  <div 
                    className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center ${dragActive ? 'border-primary-500 bg-primary-50' : submitAttempted && selectedFiles.length === 0 ? 'border-red-300' : 'border-gray-300'}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex justify-center text-sm text-gray-600">
                        <button
                          type="button"
                          onClick={() => document.getElementById('file-upload').click()}
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 px-2 py-1"
                        >
                          <span>Upload Multiple Files</span>
                        </button>
                        <input
                          id="file-upload"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each (Max 5 images)</p>
                    </div>
                  </div>
                  {submitAttempted && selectedFiles.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">At least one image is required</p>
                  )}
                </div>

                {previewUrls.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Images ({previewUrls.length})</p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`} 
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Listing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
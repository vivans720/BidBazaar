import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    duration: '',
    images: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Create preview URLs for the selected files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const uploadImages = async (files) => {
    const uploadedImages = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        console.log('Uploading image:', file.name);
        const response = await api.post('/upload', formData);
        console.log('Upload response:', response.data);
        
        if (!response.data.url) {
          throw new Error('No URL received from upload service');
        }
        
        uploadedImages.push({
          url: response.data.url,
          public_id: response.data.public_id
        });
      } catch (err) {
        console.error('Error uploading image:', {
          fileName: file.name,
          error: err.response?.data || err.message
        });
        throw new Error(`Failed to upload image ${file.name}: ${err.response?.data?.error || err.message}`);
      }
    }
    return uploadedImages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Create New Listing</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-black rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="mt-1 block w-full border-black rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-black rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            <option value="handicrafts">Handicrafts</option>
            <option value="paintings">Paintings</option>
            <option value="decor">Decor</option>
            <option value="jewelry">Jewelry</option>
            <option value="furniture">Furniture</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Starting Price (₹)</label>
          <input
            type="number"
            name="startingPrice"
            value={formData.startingPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="mt-1 block w-full border-black rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (hours)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="168"
            required
            className="mt-1 block w-full border-black rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">Minimum 1 hour, maximum 7 days (168 hours)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images</label>
          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            multiple
            accept="image/*"
            required
            className="mt-1 block w-full border-black rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2"
          />
          <p className="mt-1 text-sm text-gray-500">Select one or more images for your product</p>
          
          {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="h-24 w-24 object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
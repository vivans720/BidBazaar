import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col lg:flex-row">
      {/* Left side - Image and text */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d="M0,0 L100,0 L100,100 L0,100 Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
            />
            <path 
              d="M0,0 L100,100 M100,0 L0,100" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="0.5"
            />
          </svg>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-6">Welcome to BidBazaar</h1>
          <p className="text-xl mb-6">Join our growing marketplace of buyers and sellers. Create an account today to start bidding on unique items.</p>
          <div className="flex space-x-4 mt-6">
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <p className="text-lg font-bold">50K+</p>
              <p className="text-sm">Active users</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <p className="text-lg font-bold">10K+</p>
              <p className="text-sm">Products</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <p className="text-lg font-bold">5K+</p>
              <p className="text-sm">Daily bids</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-white text-opacity-80 italic">
            "BidBazaar has transformed the way I shop for unique items. The bidding process is exciting and I've found amazing deals!"
          </p>
          <div className="mt-4 flex items-center">
            <div className="h-10 w-10 rounded-full bg-white text-primary-600 flex items-center justify-center font-bold">
              JS
            </div>
            <div className="ml-3">
              <p className="font-medium">Jane Smith</p>
              <p className="text-sm text-white text-opacity-70">Loyal Customer</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-1 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 text-center">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already registered?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                Sign in to your account
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-100">
              <RegisterForm />
            </div>
            
            <div className="mt-6 text-center text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
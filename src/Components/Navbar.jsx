import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Search, Bell, UserCircle, ShoppingCart } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">BidBazaar</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/auctions" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                Auctions
              </Link>
              <Link to="/how-it-works" className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                How It Works
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search auctions..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-6 w-6 text-gray-600" />
            </button>
            <Link to="/cart" className="p-2 rounded-full hover:bg-gray-100 relative">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <UserCircle className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
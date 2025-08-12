# 🏷️ BidBazaar - Online Auction Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for online bidding and auctions with integrated wallet system and real-time bidding capabilities.

![BidBazaar](client/src/assets/logo.png)

## 🌟 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with role-based access control
- **Three user roles**: Admin, Vendor (Seller), and Buyer
- **Secure registration/login** with profile image upload
- **Password encryption** using bcryptjs

### 💰 Integrated Wallet System
- **Digital wallet** for each user with INR currency support
- **Secure fund deposits** via multiple payment methods (Debit Card, Bank Transfer, UPI)
- **Automatic bid deductions** and refunds
- **Complete transaction history** with detailed audit trail
- **Real-time balance updates** during bidding

### 🎯 Smart Bidding System
- **Incremental bidding** - only charges the difference when increasing bids
- **Automatic refunds** for outbid users
- **Insufficient funds protection** prevents overbidding
- **Real-time bid updates** and notifications
- **Auction timer** with automatic closure

### 🛍️ Product Management
- **Product listings** with image uploads via Cloudinary
- **Category-based organization** for easy browsing
- **Detailed product information** with descriptions and starting prices
- **Auction duration management** with automatic expiry handling

### 👥 User Management
- **Comprehensive user profiles** with contact information
- **Role-based dashboards** for different user types
- **Profile image uploads** with file validation
- **Admin user management** capabilities

### 📊 Dashboard & Analytics
- **Buyer Dashboard**: Wallet balance, active bids, transaction history
- **Vendor Dashboard**: Product listings, sales analytics, earnings
- **Admin Dashboard**: User management, platform oversight
- **Real-time statistics** and financial tracking

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image storage
- **Express FileUpload** for file handling
- **bcryptjs** for password hashing

### Frontend
- **React 18** with modern hooks
- **React Router Dom** for navigation
- **Tailwind CSS** for styling
- **Heroicons** for UI icons
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **Axios** for API calls

### Development Tools
- **Vite** for fast development builds
- **Concurrently** for running frontend/backend together
- **Nodemon** for backend auto-restart
- **ESLint** for code quality

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/bidbazaar.git
cd bidbazaar
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/bidbazaar

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# File Upload Configuration
FILE_UPLOAD_PATH=./uploads
MAX_FILE_UPLOAD=1000000
```

5. **Start the application**

For development (runs both frontend and backend):
```bash
npm run dev
```

Or start them separately:
```bash
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

6. **Access the application**
     bidbazaar.pages.dev

## 📋 API Endpoints

### Authentication
```
POST /api/auth/register     # Register new user
POST /api/auth/login        # User login
GET  /api/auth/logout       # User logout
PUT  /api/auth/updatepassword # Update password
```

### Users
```
GET  /api/users/me          # Get current user profile
PUT  /api/users/updateprofile # Update user profile
POST /api/users/upload-image  # Upload profile image
GET  /api/users             # Get all users (Admin only)
```

### Wallet
```
GET  /api/wallet            # Get wallet balance
POST /api/wallet/deposit    # Deposit funds
POST /api/wallet/withdraw   # Withdraw funds
GET  /api/wallet/transactions # Get transaction history
GET  /api/wallet/stats      # Get wallet statistics
```

### Products
```
GET  /api/products          # Get all products
GET  /api/products/:id      # Get single product
POST /api/products          # Create product (Vendor/Admin)
PUT  /api/products/:id      # Update product (Vendor/Admin)
DELETE /api/products/:id    # Delete product (Vendor/Admin)
```

### Bidding
```
GET  /api/bids              # Get all bids
GET  /api/bids/user/:id     # Get user's bids
POST /api/bids              # Place a bid
GET  /api/bids/product/:id  # Get product bids
```

## 🗂️ Project Structure

```
BidBazaar/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── bids/       # Bidding components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── products/   # Product components
│   │   │   └── wallet/     # Wallet components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets
│   └── package.json
├── controllers/            # Express route controllers
├── models/                 # Mongoose schemas
├── routes/                 # API routes
├── middleware/             # Custom middleware
├── uploads/                # File upload directory
├── server.js              # Express server setup
├── package.json
└── README.md
```

## 🔑 Key Features Explained

### 💳 Wallet System
The integrated wallet system ensures secure and transparent financial transactions:
- Users deposit money using various payment methods
- Bid amounts are immediately deducted from wallet balance
- Automatic refunds when outbid by other users
- Winners keep their final bid amount deducted (no additional charges)
- Complete transaction audit trail

### 📈 Smart Bidding
The bidding system is designed for fairness and efficiency:
- **Incremental Charging**: When you increase your bid from ₹500 to ₹600, only ₹100 is deducted
- **Automatic Refunds**: Previous bidders get immediate refunds when outbid
- **Balance Protection**: Cannot bid more than available wallet balance
- **Real-time Updates**: Instant bid updates across all users

### 🎨 Modern UI/UX
- **Responsive design** that works on all devices
- **Clean, intuitive interface** with Tailwind CSS
- **Smooth animations** with Framer Motion
- **Toast notifications** for user feedback
- **Loading states** and error handling

## 🔒 Security Features

- **JWT authentication** with secure token handling
- **Password hashing** with bcryptjs
- **File upload validation** with size and type restrictions
- **Role-based access control** for API endpoints
- **Input validation** and sanitization
- **CORS protection** for cross-origin requests


# Online Bidding/Auction Site

A MERN stack application for an online bidding/auction platform.

## User Management Module

The first module implemented includes:

- User registration and authentication
- Role-based access control (Admin, Buyer, Vendor)
- User profile management
- Admin user management capabilities

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/auction-site
     JWT_SECRET=your_jwt_secret_key_change_in_production
     JWT_EXPIRE=30d
     ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Testing with Postman

Import the provided Postman collection and environment files from the `postman` directory to test the API endpoints.

### Authentication Endpoints

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login a user
- GET `/api/auth/logout` - Logout a user
- PUT `/api/auth/updatepassword` - Update user password

### User Endpoints

- GET `/api/users/me` - Get current logged in user
- PUT `/api/users/updateprofile` - Update user profile
- GET `/api/users` - Get all users (Admin only)
- GET `/api/users/:id` - Get single user (Admin only)
- POST `/api/users` - Create user (Admin only)
- PUT `/api/users/:id` - Update user (Admin only)
- DELETE `/api/users/:id` - Delete user (Admin only)

## Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected routes:

1. Register or login to get a token
2. Include the token in the Authorization header of your requests:
   ```
   Authorization: Bearer <your_token>
   ```

## Role-Based Access Control

- **Admin**: Full access to all endpoints
- **Buyer**: Access to their own profile and auction-related endpoints
- **Vendor**: Access to their own profile, product listings, and auction-related endpoints
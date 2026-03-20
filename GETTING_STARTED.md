# ShieldGig - Getting Started Guide

## Overview

ShieldGig is an AI-powered parametric insurance platform that protects gig workers from income loss due to external disruptions like weather, pollution, and social events.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shieldgig
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start the backend server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your API URL

# Start the frontend development server
npm run dev
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod

# The backend will automatically connect to mongodb://localhost:27017/shieldgig
```

#### Option B: MongoDB Atlas
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend/.env

## Environment Variables

### Backend (.env)

```env
MONGODB_URI=mongodb://localhost:27017/shieldgig
JWT_SECRET=your_jwt_secret_key_here
WEATHER_API_KEY=your_weather_api_key_here
AQI_API_KEY=your_aqi_api_key_here
PORT=5000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend in production mode:
```bash
cd backend
npm start
```

## Default Users

For testing purposes, you can create the following user types:

### Worker User
- Email: `worker@example.com`
- Password: `password123`
- Role: Worker

### Admin User
- Email: `admin@example.com`
- Password: `admin123`
- Role: Admin

## Features

### User Features
- **Registration & Login**: Secure authentication with JWT
- **Dashboard**: Overview of insurance status and claims
- **Insurance Plans**: Choose from Basic (₹20/week), Standard (₹40/week), Premium (₹60/week)
- **Claims Management**: View and track insurance claims
- **Profile Management**: Update personal information and preferences

### Admin Features
- **Dashboard**: Platform overview and statistics
- **User Management**: View and manage all registered users
- **Claims Review**: Process and approve/reject claims
- **Fraud Detection**: Monitor suspicious activities
- **System Monitoring**: Track environmental triggers and system health

### Automated Features
- **Environmental Monitoring**: Real-time weather and AQI monitoring
- **Trigger Detection**: Automatic claim generation based on predefined thresholds
- **Fraud Detection**: AI-powered analysis of suspicious patterns
- **Instant Payouts**: Simulated payment processing for approved claims

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users/dashboard` - Get user dashboard data
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/claims` - Get user claims

### Plans
- `GET /api/plans` - Get available insurance plans
- `POST /api/plans/subscribe` - Subscribe to a plan
- `GET /api/plans/current` - Get current subscription

### Claims
- `GET /api/claims` - Get user claims
- `POST /api/claims` - Create new claim (for testing)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Get all users
- `GET /api/admin/claims` - Get all claims
- `PUT /api/admin/claims/:id` - Update claim status
- `GET /api/admin/fraud-alerts` - Get fraud alerts

## Insurance Plans

### Basic Plan (Low Risk)
- **Premium**: ₹20/week
- **Coverage**: ₹800
- **Features**: Weather protection, AQI coverage, instant claims

### Standard Plan (Medium Risk)
- **Premium**: ₹40/week
- **Coverage**: ₹1,600
- **Features**: All Basic features + priority processing

### Premium Plan (High Risk)
- **Premium**: ₹60/week
- **Coverage**: ₹2,400
- **Features**: All Standard features + enhanced fraud protection

## Trigger Conditions

Claims are automatically generated when:

- **Rain**: Rainfall exceeds 50mm
- **Heat**: Temperature exceeds 45°C
- **AQI**: Air Quality Index exceeds 300
- **Curfew**: Zone restrictions detected

## Testing

### Creating Test Claims

1. Login as a worker user
2. Navigate to Claims page
3. Click "Test Claim" button
4. Fill in the test claim details
5. Submit to see the claim processing workflow

### Admin Testing

1. Login as admin user
2. Navigate to Admin Dashboard
3. Review pending claims
4. Approve or reject claims
5. Monitor fraud detection alerts

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if MongoDB is running
   - Verify environment variables
   - Check port availability (default: 5000)

2. **Frontend can't connect to backend**
   - Verify API URL in frontend .env
   - Check if backend is running
   - Check CORS configuration

3. **Database connection errors**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure MongoDB credentials are correct

### Logs

- Backend logs: Console output from backend server
- Frontend logs: Browser developer console
- Database logs: MongoDB logs (if using local instance)

## Development

### Project Structure

```
shieldgig/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── backend/           # Node.js backend API
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic services
│   ├── middleware/     # Express middleware
│   └── server.js       # Main server file
└── README.md           # This file
```

### Code Style

- **Frontend**: ESLint + Prettier configuration
- **Backend**: Standard.js for code formatting
- **Database**: Mongoose ODM for MongoDB

## Deployment

### Frontend Deployment

1. Build the application:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

### Backend Deployment

1. Set production environment variables
2. Install dependencies:
```bash
cd backend
npm install --production
```

3. Start the production server:
```bash
npm start
```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

## License

This project is licensed under the ISC License.

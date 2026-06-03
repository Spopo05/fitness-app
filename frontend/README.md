# Fitness App Backend API

A comprehensive Express.js backend for a fitness application with user authentication, subscription management, messaging, and more.

## Setup and Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd fitness-app-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your actual configuration

# Start the server
npm run dev
```

## Features

- User authentication with JWT and role-based access control
- Subscription management with multiple duration options
- Direct messaging system between users and coaches
- User profile with weight tracking and diet plan management
- Coach dashboard for managing clients and creating diet plans
- Admin panel for managing users, coaches, and subscriptions
- Progress tracking and workout history

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/update-password` - Update password

### User Management

- `PATCH /api/users/profile` - Update user profile
- `POST /api/users/weight` - Add weight entry
- `GET /api/users/weight` - Get weight history
- `GET /api/users/diet-plan` - Get user's diet plan
- `GET /api/users/workouts/upcoming` - Get upcoming workouts
- `GET /api/users/workouts/history` - Get workout history
- `GET /api/users/coach` - Get assigned coach

### Coach Management

- `GET /api/coaches/clients` - Get coach's clients
- `GET /api/coaches/clients/:clientId` - Get client details
- `POST /api/coaches/clients/:clientId/diet-plan` - Create diet plan for client
- `POST /api/coaches/clients/:clientId/workouts` - Create workout for client
- `GET /api/coaches/clients/:clientId/workouts` - Get client's workouts
- `PATCH /api/coaches/workouts/:workoutId` - Update client's workout

### Admin Management

- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user details
- `POST /api/admin/users` - Create new user
- `PATCH /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user
- `POST /api/admin/users/:userId/assign-coach` - Assign coach to user
- `GET /api/admin/subscriptions` - Get all subscriptions
- `GET /api/admin/subscriptions/:subscriptionId` - Get subscription details
- `POST /api/admin/subscriptions` - Create subscription
- `PATCH /api/admin/subscriptions/:subscriptionId` - Update subscription

### Subscription Management

- `GET /api/subscriptions/plans` - Get subscription plans
- `GET /api/subscriptions/my-subscription` - Get current user's subscription
- `POST /api/subscriptions/subscribe` - Subscribe to a plan
- `PATCH /api/subscriptions/cancel` - Cancel subscription
- `PATCH /api/subscriptions/change-plan` - Change subscription plan

### Messaging

- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/unread/count` - Get unread message count
- `GET /api/messages/:userId` - Get conversation messages
- `PATCH /api/messages/:messageId/read` - Mark message as read

### Diet Plans

- `GET /api/diet-plans/:dietPlanId` - Get diet plan
- `PATCH /api/diet-plans/:dietPlanId` - Update diet plan (coach or admin only)
- `DELETE /api/diet-plans/:dietPlanId` - Delete diet plan (coach or admin only)

### Workouts

- `GET /api/workouts/:workoutId` - Get workout details
- `PATCH /api/workouts/:workoutId/exercises/:exerciseId` - Update exercise status
- `PATCH /api/workouts/:workoutId/complete` - Mark workout as completed

## Technologies Used

- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation
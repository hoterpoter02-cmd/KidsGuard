# ChildGuard Backend

A Node.js/Express backend API for managing child smartwatch data, including location tracking, health metrics, and geofencing capabilities.

## Features

- **User Authentication**: Email/password and Google OAuth authentication
- **Watch Management**: Link and manage multiple smartwatches via serial numbers
- **Real-time Watch Data**: Track heart rate, step count, GPS location, battery level, and audio recordings
- **Geofencing**: Create and manage allowed zones with radius-based alerts
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Authentication**: JWT tokens
- **API Documentation**: Swagger UI
- **Testing**: Jest with MongoDB Memory Server

## Project Structure

```
src/
├── app.ts                    # Express app configuration
├── config/
│   ├── db.ts                 # MongoDB connection
│   ├── server.ts             # Server entry point
│   └── swagger.ts            # Swagger setup
├── controllers/              # Request handlers
│   ├── authController.ts
│   ├── userController.ts
│   ├── watchDataController.ts
│   ├── allowedZoneController.ts
│   └── linkWatchController.ts
├── middlewares/
│   └── isAuthenticated.ts    # Auth middleware
├── models/                   # Mongoose schemas
│   ├── User.ts
│   ├── WatchData.ts
│   ├── AllowedZone.ts
│   └── Alert.ts
└── routes/                   # API route definitions
    ├── authRoutes.ts
    ├── userRoutes.ts
    ├── watchDataRoutes.ts
    ├── allowedZoneRoutes.ts
    └── linkWatchRoutes.ts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ChildGuardNode
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Running the Application

**Development mode:**

```bash
npm run dev
```

**Build for production:**

```bash
npm run build
npm start
```

**Run tests:**

```bash
npm test
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Login with Google OAuth
- `POST /api/auth/logout` - Logout current user

### User Management

- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile

### Watch Linking

- `POST /api/link-watch` - Link a watch to user account
- `DELETE /api/link-watch/:serialNumber` - Unlink a watch

### Watch Data

- `POST /api/watch-data` - Submit watch data
- `GET /api/watch-data/:serialNumber` - Get watch data history
- `GET /api/watch-data/:serialNumber/latest` - Get latest data point

### Allowed Zones (Geofencing)

- `POST /api/allowed-zone` - Create a geofence zone
- `GET /api/allowed-zone/:serialNumber` - Get all zones for a watch
- `PUT /api/allowed-zone/:id` - Update a zone
- `DELETE /api/allowed-zone/:id` - Delete a zone

## API Documentation

Once the server is running, visit:

```
http://localhost:3000/api-docs
```

## Data Models

### User

- Email, name, password (hashed)
- Google OAuth support
- Array of linked watch serial numbers

### WatchData

- Serial number (indexed)
- Heart rate, step count, battery level
- GPS coordinates (latitude/longitude)
- Recorded audio (binary)
- Automatic retention: Only last 10 records per device

### AllowedZone

- Serial number reference
- Zone name
- Center coordinates (lat/lng)
- Radius in meters

## Environment Variables

| Variable         | Description               | Required           |
| ---------------- | ------------------------- | ------------------ |
| `PORT`           | Server port               | No (default: 3000) |
| `MONGODB_URI`    | MongoDB connection string | Yes                |
| `SESSION_SECRET` | Express session secret    | Yes                |
| `JWT_SECRET`     | JWT signing secret        | Yes                |

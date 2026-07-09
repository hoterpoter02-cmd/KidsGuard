# ChildGuard Backend

ChildGuard Backend is a Node.js and TypeScript API for smartwatch-based child monitoring. It stores watch telemetry, linked devices, allowed geofence zones, emergency contact numbers, and audio recordings, then exposes the data through authenticated REST endpoints and Swagger documentation.

## What it does

- Authenticates users with JWT access tokens and refresh tokens
- Links one or more watch serial numbers to a user account
- Accepts watch telemetry with optional uploaded audio
- Stores geofence zones and creates notifications when a watch leaves them
- Exposes user, admin, audio, and emergency-number endpoints
- Serves OpenAPI docs at `/api-docs`

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express
- Database: MongoDB with Mongoose
- Auth: JWT bearer tokens plus refresh-token cookies
- File upload: Multer
- Audio processing: fluent-ffmpeg with ffmpeg-static
- API docs: swagger-jsdoc + swagger-ui-express
- Tests: Jest, Supertest, mongodb-memory-server

## Project Structure

```
src/
    app.ts                 # Express app configuration and route wiring
    config/
        db.ts                # MongoDB connection helper
        server.ts            # Server bootstrap and graceful shutdown
        swagger.ts           # Swagger/OpenAPI setup
    controllers/           # Route handlers and domain logic
    middlewares/           # Auth and admin guards
    models/                # Mongoose schemas
    routes/                # API route definitions
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB running locally or in the cloud
- npm

### Install

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
MONGODB_URI=
JWT_SECRET=your-jwt-secret
API_BASE_URL=http://localhost:3000
Hash_Salt=10
DAHL_API_KEY=your-dahl-api-key
NODE_ENV=development
```

`MONGODB_URI` and `JWT_SECRET` should be set explicitly for any non-local environment. The audio-analysis pipeline also uses `DAHL_API_KEY` when it is available.

### Run

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Tests:

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Authentication

Authentication is JWT-based.

- `POST /api/auth/register` creates a user and returns an access token plus refresh token
- `POST /api/auth/login` validates email and password and returns tokens
- `POST /api/auth/refresh-token` issues new tokens from the refresh token cookie, request body, or bearer token
- `POST /api/auth/logout` clears the refresh token cookie

Protected routes expect `Authorization: Bearer <access-token>`.

## API Endpoints

### User

- `GET /api/user/me` returns the authenticated user profile
- `PUT /api/user/me` updates the authenticated user name or photo URL
- `DELETE /api/user/me` deletes the authenticated user account
- `GET /api/user/notifications` returns alerts for the authenticated user

### Watch Linking

- `POST /api/link-watch` links a watch serial number to the current user

### Watch Data

- `POST /api/watch-data` uploads telemetry and optional audio using `multipart/form-data`
- `GET /api/watch-data/:serialNumber` returns the latest data point for a watch owned by the current user

### Audio

- `GET /api/audio/:serialNumber` returns the latest recorded audio metadata for a watch
- `GET /api/audio/file/:audioId` streams the raw audio file back as `audio/wav`

### Allowed Zones

- `POST /api/allowed-zone` creates a geofence zone for a linked watch
- `GET /api/allowed-zone/:serialNumber` lists zones for a watch
- `DELETE /api/allowed-zone/:zoneId` removes a zone

### Emergency Numbers

- `GET /api/emergency-number/:serialNumber` fetches the current emergency number
- `POST /api/emergency-number/:serialNumber` creates or updates the emergency number for a linked watch

### Admin

All admin routes require an authenticated user with `role: admin`.

- `GET /api/admin/users` lists users without passwords
- `GET /api/admin/watchData/:serialNumber` returns all watch data for a serial number
- `GET /api/admin/audio/:serialNumber` returns all recorded audio for a serial number

## Data Model Notes

- `User` stores name, email, hashed password, optional Google ID, photo URL, role, and linked watch serial numbers
- `WatchData` stores heart rate, step count, GPS coordinates, battery level, and timestamps
- `RecordedAudio` stores the raw audio buffer and analysis metadata
- `AllowedZone` stores the geofence name, center coordinates, and radius
- `EmergencyNumber` stores one emergency contact per watch serial number

Watch data and recorded audio are automatically pruned so only the latest 10 records per serial number are kept.

## Behavior Notes

- Geofence alerts are created when a location update falls outside all allowed zones for a linked watch
- Audio uploads may trigger background analysis and alert creation
- The API returns JSON errors for unknown routes and centralized server errors

## Swagger Docs

Once the server is running, open:

```text
http://localhost:3000/api-docs
```

# Authentication Service

The authentication microservice for the Video Game Database project, handling user registration, authentication, and authorization.

## Features

- User registration and login
- JWT-based authentication
- Password encryption
- User profile management
- Role-based authorization

## Project Structure

```
auth-service/
├── controllers/          # Request handlers
│   └── authController.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── validation.js
├── models/             # Database models
│   └── User.js
├── routes/            # API routes
│   └── authRoutes.js
├── utils/            # Utility functions
├── server.js        # Service entry point
└── config/         # Configuration files
```

## API Endpoints

### Authentication
```
POST /api/auth/register
- Register a new user
- Body: { username, email, password }

POST /api/auth/login
- Authenticate user
- Body: { email, password }

GET /api/auth/profile
- Get user profile
- Headers: Authorization: Bearer <token>

PUT /api/auth/profile
- Update user profile
- Headers: Authorization: Bearer <token>
- Body: { username, email }
```

## Environment Variables

Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-game-db
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Start the service:
```bash
npm start
```

For development with nodemon:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

## Docker Support

Build the container:
```bash
docker build -t auth-service .
```

Run the container:
```bash
docker run -p 5000:5000 --env-file .env auth-service
```

## Error Handling

The service implements standardized error responses:
```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- Rate limiting
- Input validation
- XSS protection
- CORS configuration 
# Video Game Database Backend

The microservices-based backend for the Video Game Database project.

## Architecture

The backend is composed of two main microservices:
- Auth Service: Handles user authentication and authorization
- Game Service: Manages game data and user collections

## Service Structure

```
video-game-db-backend/
├── auth-service/          # Authentication microservice
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── server.js        # Service entry point
│
└── game-service/         # Game management microservice
    ├── controllers/     # Request handlers
    ├── middleware/      # Custom middleware
    ├── models/         # Database models
    ├── routes/         # API routes
    └── server.js       # Service entry point
```

## Technology Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Docker for containerization

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Docker (optional)

## Development Setup

1. Install dependencies for both services:
```bash
cd auth-service && npm install
cd ../game-service && npm install
```

2. Set up MongoDB:
- Ensure MongoDB is running locally
- Create a database named 'video-game-db'

3. Configure environment variables for each service (see individual service READMEs)

4. Start the services:
```bash
# In auth-service directory
npm start

# In game-service directory
npm start
```

## API Documentation

See individual service READMEs for detailed API documentation:
- [Auth Service README](./auth-service/README.md)
- [Game Service README](./game-service/README.md)

## Docker Deployment

Each service can be containerized independently. See the Docker section in each service's README for specific instructions.

## Development Guidelines

- Follow RESTful API design principles
- Implement proper error handling
- Write unit tests for new features
- Use async/await for asynchronous operations
- Follow the established coding style

## Monitoring and Logging

- Each service implements its own logging system
- Use environment variables for configuration
- Monitor service health endpoints
- Implement proper error tracking

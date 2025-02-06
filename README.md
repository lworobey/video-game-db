# Video Game Database

A full-stack application for managing and collecting video games, featuring user authentication and game collection management.

## Project Structure

```
video-game-db/
├── video-game-db-frontend/    # React frontend application
└── video-game-db-backend/     # Microservices backend
    ├── auth-service/          # Authentication service
    └── game-service/          # Game management service
```

## Features

- User authentication and authorization
- Video game searching and adding
- Personal game collection management
- Modern, responsive UI

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Docker (optional, for containerized deployment)

## Getting Started

### Backend Setup

1. Auth Service Setup:
```bash
cd video-game-db-backend/auth-service
npm install
# Create .env file with required environment variables
npm start
```

2. Game Service Setup:
```bash
cd video-game-db-backend/game-service
npm install
# Create .env file with required environment variables
npm start
```

### Frontend Setup

```bash
cd video-game-db-frontend
npm install
npm start
```

## Environment Variables

### Auth Service
Create a `.env` file in the auth-service directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-game-db
JWT_SECRET=your_jwt_secret
```

### Game Service
Create a `.env` file in the game-service directory:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/video-game-db
```

## Docker Deployment
The application can be containerized using Docker. Each service has its own Dockerfile and the project includes a docker-compose.yml file for orchestrating all services.

Build and run all services:
```bash
docker-compose up --build
```

## API Documentation

### Auth Service Endpoints
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile

### Game Service Endpoints
- GET `/api/games` - Get all games
- GET `/api/games/:id` - Get specific game
- POST `/api/games` - Add new game
- PUT `/api/games/:id` - Update game
- DELETE `/api/games/:id` - Delete game
- GET `/api/collection` - Get user's game collection
- POST `/api/collection/add` - Add game to collection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

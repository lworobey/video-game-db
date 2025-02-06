# Game Service

The game management microservice for the Video Game Database project, handling game data and user collections.

## Features

- Game CRUD operations
- User game collections
- Game search and filtering
- Game metadata management
- Rating and review system

## Project Structure

```
game-service/
├── controllers/          # Request handlers
│   ├── gameController.js
│   └── collectionController.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── validation.js
├── models/             # Database models
│   ├── Game.js
│   ├── Collection.js
│   └── Review.js
├── routes/            # API routes
│   ├── gameRoutes.js
│   └── collectionRoutes.js
├── utils/            # Utility functions
├── server.js        # Service entry point
└── config/         # Configuration files
```

## API Endpoints

### Games
```
GET /api/games
- Get all games
- Query params: page, limit, search, genre, platform

GET /api/games/:id
- Get specific game details

POST /api/games
- Add new game
- Body: { title, description, genre, platform, releaseDate }

PUT /api/games/:id
- Update game details
- Body: { title, description, genre, platform, releaseDate }

DELETE /api/games/:id
- Delete game
```

### Collections
```
GET /api/collection
- Get user's game collection
- Headers: Authorization: Bearer <token>

POST /api/collection/add
- Add game to collection
- Headers: Authorization: Bearer <token>
- Body: { gameId }

DELETE /api/collection/:gameId
- Remove game from collection
- Headers: Authorization: Bearer <token>
```

## Environment Variables

Create a `.env` file in the root directory:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/video-game-db
AUTH_SERVICE_URL=http://localhost:5000
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
docker build -t game-service .
```

Run the container:
```bash
docker run -p 5001:5001 --env-file .env game-service
```

## Data Models

### Game Schema
```json
{
  "title": "String",
  "description": "String",
  "genre": ["String"],
  "platform": ["String"],
  "releaseDate": "Date",
  "rating": "Number",
  "reviews": ["ReviewSchema"]
}
```

### Collection Schema
```json
{
  "userId": "String",
  "games": ["GameSchema"],
  "lastUpdated": "Date"
}
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
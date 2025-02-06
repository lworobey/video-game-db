# Video Game Database Frontend

The React-based frontend application for the Video Game Database project.


## Technology Stack

- React.js with Vite
- React Router for navigation
- CSS Modules for styling
- Axios for API communication

## Project Structure

```
video-game-db-frontend/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service integrations
│   ├── utils/             # Utility functions
│   ├── App.jsx           # Main application component
│   └── index.jsx         # Application entry point
├── public/               # Static assets
└── package.json         # Project dependencies and scripts
```

## Features

- Responsive game browsing interface
- User authentication flows
- Personal game collection management
- Search and filter functionality
- Modern and intuitive UI/UX

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory:
```
VITE_AUTH_API_URL=http://localhost:5000/api
VITE_GAME_API_URL=http://localhost:5001/api
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev` - Runs the app in development mode with hot reload
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally
- `npm test` - Launches the test runner
- `npm run lint` - Runs ESLint for code quality
- `npm run format` - Formats code with Prettier

## Development Guidelines

- Follow the established component structure
- Use CSS Modules for component-specific styles
- Implement responsive design practices
- Write unit tests for new components
- Follow the established naming conventions

## Component Development

### Creating New Components
1. Create a new directory under `src/components`
2. Include the component file and its styles
3. Export the component as default
4. Document props using PropTypes

Example:
```jsx
// GameCard/GameCard.jsx
import PropTypes from 'prop-types';
import styles from './GameCard.css';

const GameCard = ({ title, description, image }) => {
  return (
    <div className={styles.card}>
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

GameCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default GameCard;
```

## State Management

- Use React Context for global state
- Implement Redux only if complexity increases
- Keep component state local when possible
- Use custom hooks for shared logic

## API Integration

- All API calls should be centralized in the `services` directory
- Use environment variables for API endpoints
- Implement proper error handling
- Add loading states for async operations

## Docker Support

Build the container:
```bash
docker build -t video-game-db-frontend .
```

Run the container:
```bash
docker run -p 5173:5173 video-game-db-frontend
```

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Performance Considerations

- Implement lazy loading for images
- Use code splitting for routes
- Optimize bundle size
- Cache API responses when appropriate
- Use memoization for expensive computations 
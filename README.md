# Help Me Recipe

A modern recipe finder application that helps you discover delicious recipes based on the ingredients you have at home.

## Features

- Search recipes by ingredients
- Filter by dietary restrictions (vegetarian, vegan, gluten-free, etc.)
- Filter by cuisine type and meal type
- Filter by cooking time
- View detailed recipe information including:
  - Nutritional information
  - Step-by-step instructions
  - Preparation time
  - Serving size
- Popular recipes showcase
- Mobile-responsive design

## Tech Stack

- Frontend:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - React Hooks

- Backend:
  - Node.js
  - Express
  - TypeScript
  - Spoonacular API

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
   - Create `.env` file in the backend directory
   - Create `.env.local` file in the frontend directory
   - Add your Spoonacular API key and other configuration

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server (in a new terminal)
cd frontend
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

### Backend (.env)
```
PORT=3001
SPOONACULAR_API_KEY=your_api_key_here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

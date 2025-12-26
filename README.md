# AI Nutritionist

A modern, AI-powered nutrition application that generates personalized meal plans using advanced language models. This full-stack application combines a React frontend with a FastAPI backend to deliver an intuitive user experience for creating customized nutrition plans.

## Features

- **AI-Powered Meal Planning**: Uses OpenAI's GPT models to generate personalized meal plans
- **Modern UI/UX**: Beautiful, responsive interface with glassmorphism design
- **Authentication System**: Secure user authentication and profile management
- **Personalized Nutrition**: Custom meal plans based on dietary goals, restrictions, and preferences
- **Real-time Generation**: Fast meal plan generation with detailed nutritional information

## Tech Stack

### Frontend
- **React 19** - Modern JavaScript library for building user interfaces
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Router** - Declarative routing for React applications

### Backend
- **FastAPI** - Modern, fast web framework for building APIs with Python
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping for database operations
- **OpenAI API** - Integration with advanced language models for meal plan generation
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server for running the application

## Project Structure

```
ai-nutritionist/
├── backend/
│   ├── ai/
│   │   ├── clean_data.py
│   │   ├── generator.py
│   │   └── prompt_template.py
│   ├── core/
│   │   └── config.py
│   ├── database/
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── routers/
│   │   ├── auth.py
│   │   └── mealplan.py
│   ├── .env.example
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\\Scripts\\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file based on `.env.example` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be running at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   VITE_API_URL=http://localhost:8000
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be running at `http://localhost:5173` (or similar)

## Key Features

### Modern UI with Glassmorphism Design
- Beautiful glassmorphism navbar with animated effects
- Responsive design that works on all devices
- Smooth animations and transitions
- User profile display with actual pictures
- Authentication-based visibility (Login/Sign Up when unauthenticated, user menu when authenticated)

### AI-Powered Meal Planning
- Generates 7-day meal plans with 3 meals + 2 snacks per day
- Respects calorie targets and macro ratios
- Considers dietary restrictions and preferences
- Provides detailed nutritional information

### Security
- JWT-based authentication
- Secure password hashing
- Environment-based configuration

## API Endpoints

- `GET /` - Health check endpoint
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/mealplan/` - Generate personalized meal plan

## Environment Variables

### Backend
- `OPENAI_API_KEY` - Your OpenAI API key
- `JWT_SECRET` - Secret key for JWT token generation
- `DATABASE_URL` - Database connection string

### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_API_BASE_URL` - Backend API base URL

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the powerful language models
- The FastAPI team for the excellent web framework
- The React team for the component-based architecture
- Tailwind CSS for the utility-first styling approach
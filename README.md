# Job Guru - AI-Powered Interview Assistant

Job Guru is a comprehensive SaaS platform designed to help job seekers prepare for interviews, build impressive resumes, and land their dream jobs using advanced AI technology.

## Features

- **Interview Copilot**: Real-time AI assistance during interviews
- **AI Mock Interviews**: Practice with realistic interview simulations
- **Smart Resume Builder**: Create ATS-optimized resumes with AI
- **Question Bank**: Access thousands of interview questions with AI-suggested answers
- **Auto Apply**: Streamline job applications across multiple platforms
- **Interview Analytics**: Get detailed feedback and performance metrics
- **Career Coaching**: Personalized career guidance and advice
- **Collaborative Preparation**: Prepare with peers and mentors

## Technology Stack

- **Backend**: Python with FastAPI
- **Frontend**: Next.js with React
- **Database**: PostgreSQL with Supabase
- **AI**: Integration with OpenAI and Anthropic
- **Authentication**: JWT with Supabase Auth
- **Real-time**: WebSockets for live features
- **Storage**: Supabase Storage

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/job-guru.git
   cd job-guru
   ```

2. Set up the backend
   ```
   # Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env  # Edit with your own values
   
   # Run migrations
   alembic upgrade head
   
   # Start the backend server
   uvicorn app.main:app --reload
   ```

3. Set up the frontend
   ```
   cd frontend
   npm install
   npm run dev
   ```

4. Access the application at http://localhost:3000

### Using Docker

```
docker-compose up -d
```

## Project Structure

```
job-guru/
├── app/                  # Backend application
│   ├── api/              # API endpoints
│   ├── models/           # Database models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── websockets/       # WebSocket handlers
│   ├── config.py         # Configuration
│   ├── database.py       # Database connection
│   └── main.py           # Application entry point
├── frontend/             # Next.js frontend
├── migrations/           # Database migrations
├── tests/                # Test suite
├── .env.example          # Example environment variables
├── docker-compose.yml    # Docker configuration
├── Dockerfile            # Docker build file
└── requirements.txt      # Python dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

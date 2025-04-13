# Job Guru Frontend

This is the frontend application for Job Guru, an AI-powered interview preparation platform.

## Technologies Used

- Next.js - React framework for server-rendered applications
- React Query - Data fetching and caching
- Tailwind CSS - Utility-first CSS framework
- Axios - HTTP client
- React Hook Form - Form validation
- React Toastify - Toast notifications
- Socket.io Client - WebSocket communication

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

3. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── components/       # Reusable UI components
├── lib/              # Utility functions and API clients
├── pages/            # Application routes
├── public/           # Static assets
├── styles/           # Global styles and Tailwind configuration
├── .env.local        # Environment variables (create this file)
├── next.config.js    # Next.js configuration
├── package.json      # Project dependencies
└── README.md         # This file
```

## Features

- User authentication (login, registration)
- Interview Copilot - Real-time AI assistance during interviews
- Resume Builder - Create and optimize resumes
- Mock Interviews - Practice with AI-powered interviews
- Question Bank - Access to common interview questions with AI-suggested answers
- Job Applications - Search and apply for jobs

## Development

### Adding a New Page

1. Create a new file in the `pages` directory
2. Import necessary components and hooks
3. Export a React component as the default export

### Adding a New Component

1. Create a new file in the `components` directory
2. Import necessary dependencies
3. Define and export your component

### API Integration

All API calls should be made through the API client in `lib/api.js`. To add a new API endpoint:

1. Add a new method to the appropriate API object
2. Use the method in your components with React Query for data fetching

## Deployment

To build the application for production:

```
npm run build
# or
yarn build
```

To start the production server:

```
npm start
# or
yarn start
```

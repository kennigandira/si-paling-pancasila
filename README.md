
# Si Paling Pancasila

An AI-powered chat application that analyzes topics through the lens of Pancasila principles and Indonesian constitutional law.

## Features

- Real-time chat interface
- AI analysis of topics based on Pancasila principles
- Constitutional law references
- Research-backed responses
- Modern React-based UI with Tailwind CSS

## Tech Stack

- Frontend:
  - React with TypeScript
  - Tailwind CSS
  - Shadcn UI components
  - React Query for data fetching
  - Wouter for routing

- Backend:
  - Express.js
  - OpenAI integration
  - PostgreSQL with Drizzle ORM

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend server
- `/shared` - Shared TypeScript types and schemas

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY` - Your OpenAI API key
- `DATABASE_URL` - PostgreSQL database connection URL

Set these using the Replit Secrets tool.

## Deployment

This project is configured for deployment on Replit. Use the Deployments tab to publish your changes.

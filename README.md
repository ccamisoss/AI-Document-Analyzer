# AI Document Analyzer

An AI-powered full-stack application that analyzes PDF documents and returns structured summaries. Users can upload documents and optionally provide prompts to guide the analysis focus, receiving structured outputs including summaries, key points, insights, and document-scoped Q&A responses.

## Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **AI Provider**: OpenAI (with mock provider support for development)
- **Authentication**: JWT (bcrypt for password hashing)
- **File Processing**: Multer, pdf-parse

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Fetch API (native)

## Local Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- OpenAI API key (optional if using mock LLM)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables. Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_document_analyzer"
JWT_SECRET="your-secret-key-here"
OPENAI_API_KEY="your-openai-api-key"  # Optional if MOCK_LLM=true
MOCK_LLM="false"  # Set to "true" to use mock LLM provider
PORT=3001
CORS_ORIGIN="http://localhost:5173"  # Frontend URL
```

4. Set up the database:
```bash
npm run db:generate
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3001`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Main Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate and receive JWT token

### Analysis
- `POST /analysis` - Upload a PDF document and optional prompt for AI analysis
  - **Authentication**: Required (JWT token in Authorization header)
  - **Content-Type**: `multipart/form-data`
  - **Body**: 
    - `file`: PDF file (max 10MB)
    - `prompt`: Optional text prompt to guide analysis

### Health Check
- `GET /health` - Server health status

## Architecture

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │ HTTP
       │
┌──────▼──────────────────────────────────────┐
│           Backend (Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │─▶│Controller│─▶│ Service  │   │
│  └──────────┘  └──────────┘  └────┬─────┘   │
│                                    │        │
│  ┌─────────────────────────────────▼─────┐  │
│  │         AI Module                     │  │
│  │  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │Prompt Builder│─▶│ LLM Provider │   │  │
│  │  └──────────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │      Documents Service                  ││
│  │  (PDF extraction & validation)          ││
│  └─────────────────────────────────────────┘│
│                                             │
└──────┬──────────────────────────────────────┘
       │
       │ Prisma ORM
       │
┌──────▼──────┐
│ PostgreSQL  │
│  Database   │
└─────────────┘
```

### Key Architectural Principles

- **Separation of Concerns**: Routes, controllers, services, and AI logic are strictly separated
- **AI-First Design**: AI integration is abstracted through provider and prompt builder layers
- **Stateless Flow**: Each analysis request is independent (single-shot, document-scoped)
- **Provider Agnostic**: LLM provider can be swapped (OpenAI, mock, or future providers)

## AI Integration Details

For comprehensive information about the AI integration, prompt design, data flow, and security considerations, see:

🔗 **[AIPLANNING.md](./AIPLANNING.md)**

This document covers:
- AI objectives and scope
- Expected structured output format
- Prompt design and injection mitigation
- Document ingestion and processing flow
- Data persistence and retention policies
- Cost control and evaluation strategies

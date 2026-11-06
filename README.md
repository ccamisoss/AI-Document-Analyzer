# AI Document Analyzer

An AI-powered full-stack application that analyzes PDF documents and returns structured summaries. Users can upload documents and optionally provide prompts to guide the analysis focus, receiving structured outputs including summaries, key points, insights, and document-scoped Q&A responses.

Uploading the same file again reuses the stored document and adds a new analysis. An existing document can also be analyzed again without re-uploading the PDF.

## Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **File storage**: Supabase Storage
- **AI provider**: OpenRouter (mock provider available for local development)
- **Authentication**: JWT (bcrypt for password hashing)
- **File processing**: Multer, pdf-parse

### Frontend
- **Framework**: React
- **Build tool**: Vite
- **Routing**: React Router
- **Styling**: CSS Modules, with icons from MUI
- **HTTP client**: Fetch API

The interface is laid out for tablet and desktop widths.

## Local Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Supabase project with a Storage bucket named `Docs`
- OpenRouter API key (optional if using the mock LLM)

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
OPENROUTER_API_KEY="your-openrouter-api-key"  # Optional if MOCK_LLM=true
MOCK_LLM="false"  # Set to "true" to use the mock LLM provider
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SECRET_KEY="your-supabase-secret-key"
PORT=3001
CORS_ORIGIN="http://localhost:5173"  # Frontend URL
```

`OPENROUTER_API_KEY` is required unless `MOCK_LLM` is `"true"`. `DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, and `SUPABASE_SECRET_KEY` are always required.

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

3. Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL="http://localhost:3001"
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

From the repository root, `npm run dev` starts the backend and the frontend together.

## Main Endpoints

Authenticated routes expect `Authorization: Bearer <token>`.

### Authentication
- `POST /auth/register` — Register with `email` and `password` (minimum 8 characters) and receive a JWT
- `POST /auth/login` — Authenticate and receive a JWT

### Analysis
- `POST /analysis` — Upload a PDF and an optional prompt
  - **Authentication**: Required
  - **Content-Type**: `multipart/form-data`
  - **Body**:
    - `file`: PDF file (max 10MB)
    - `prompt`: Optional text to guide the analysis
- `DELETE /analysis/:id` — Delete one analysis owned by the current user

### Documents
- `GET /documents` — List the current user's documents
- `GET /documents/:id` — Fetch one document, including a signed URL for the PDF
- `DELETE /documents/:id` — Delete a document, its analyses, and the stored file
- `GET /documents/:id/analyses` — List analyses for a document
- `POST /documents/:id/analyses` — Run a new analysis on a document already stored
  - **Authentication**: Required
  - **Content-Type**: `application/json`
  - **Body**: `{ "prompt": "optional text" }`

### Health Check
- `GET /health` — Server health status

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
│                                   │         │
│  ┌────────────────────────────────▼──────┐  │
│  │         AI Module                     │  │
│  │  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │Prompt Builder│─▶│ LLM Provider │   │  │
│  │  └──────────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │      Documents Service                │  │
│  │  (PDF extraction & validation)        │  │
│  └───────────────────────────────────────┘  │
│                                             │
└──────┬───────────────────────┬──────────────┘
       │ Prisma ORM            │ Storage API
       │                       │
┌──────▼──────┐         ┌──────▼──────────┐
│ PostgreSQL  │         │ Supabase Storage│
│  Database   │         │      (PDFs)     │
└─────────────┘         └─────────────────┘
```

### Key Architectural Principles

- **Separation of concerns**: Routes, controllers, services, and AI logic are separated
- **AI-first design**: AI integration goes through a provider and a prompt builder
- **Single-shot flow**: Each analysis request is independent and document-scoped
- **Swappable provider**: The active provider is OpenRouter. `MOCK_LLM=true` uses a local mock. The provider module also contains OpenAI and Hugging Face implementations

Extracted text, users, and analyses are stored in PostgreSQL. The original PDF is stored in Supabase Storage, and the API returns a signed URL when a document is fetched.

## AI Integration Details

For the AI objectives, prompt design, data flow, and security considerations, see:

**[AIPLANNING.md](./AIPLANNING.md)**

That document covers:
- AI objectives and scope
- Expected structured output format
- Prompt design and injection mitigation
- Document ingestion and processing flow
- Data persistence and retention policies
- Cost control and evaluation strategies

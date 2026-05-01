# Phase 1 Implementation Details

## Directory Structure
```text
Easy-Chat/
├── frontend/           # Next.js Application
├── backend/            # FastAPI Application
├── specs/              # Documentation & Roadmap
└── GEMINI.md           # Agent Instructions
```

## Tech Stack Decisions
- **Next.js:** Chosen for SEO potential (if needed later) and robust routing.
- **FastAPI:** Chosen for its native support for asynchronous operations and easy integration with AI libraries (LangChain/Gemini).
- **Tailwind CSS:** For rapid UI development and consistent styling.
- **MongoDB Atlas:** Chosen as the primary and vector database. It provides a generous free tier and handles both document metadata and AI embeddings (Vector Search).

## Environment Setup
- Frontend requires `NEXT_PUBLIC_API_URL`.
- Backend requires:
  - `GEMINI_API_KEY`
  - `MONGODB_URI` (from Atlas)

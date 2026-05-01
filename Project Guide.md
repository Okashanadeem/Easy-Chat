# AI Classroom Assistant — Project Documentation (CR Copilot)

## 1. Project Overview

**Project Name:** Easy Chat — AI Assistant for Entire Class
**Owner:** Okasha (Class Representative)
**Purpose:** Build an intelligent AI chatbot that acts as a digital academic assistant for the entire class, helping students instantly access assignments, notices, lecture notes, schedules, and explanations.

---

## 2. Vision Statement

Create a reliable AI assistant that works alongside the Class Representative to reduce repetitive communication, improve information accessibility, and provide 24/7 academic support.

The system should answer questions such as:

* Where is Assignment 2 of DLD?
* When is the PF quiz?
* Share the latest class notice.
* Summarize Lecture 5.
* Explain a programming concept.

---

## 3. Core Objectives

* Centralize all class data
* Reduce repetitive messaging workload for CR
* Provide instant academic support
* Improve student communication efficiency
* Maintain updated academic knowledge base

---

## 4. Target Users

* Entire class students
* CR / Admin team
* Subject representatives
* Faculty (optional future phase)

---

## 5. Core Features (MVP)

### Academic Information Retrieval

* Assignment lookup
* Quiz / exam schedule
* Lecture note access
* Notice board search
* Important deadlines

### Smart Q&A

* Semantic search over uploaded files
* Natural language question answering
* Context-aware responses

### Admin Panel

* Upload PDFs / docs
* Add notices
* Edit deadlines
* Update class schedule

### Role-based Access

* Students: ask questions
* CR/Admin: manage knowledge base

---

## 6. Technical Architecture

```text
Frontend (Next.js / React)
        ↓
Backend API (Node.js / FastAPI)
        ↓
RAG Pipeline
   ├── Embedding Model
   ├── Vector Database
   └── Gemini API
        ↓
Admin Data Ingestion Layer
```

---

## 7. Recommended Tech Stack

### Frontend

* Next.js
* Tailwind CSS
* Chat UI

### Backend

* FastAPI or Node.js Express

### AI Layer

* Gemini API
* Embeddings API

### Database

* PostgreSQL (metadata)
* Pinecone / ChromaDB (vectors)

### File Storage

* Cloudinary / AWS S3 / local storage

---

## 8. Data Sources

* LMS screenshots / exports
* PDF lecture notes
* WhatsApp class notices
* assignment docs
* timetable files
* Google Drive links

---

## 9. RAG Data Pipeline

### Google Drive Integration (Important)

The AI model cannot directly access Google Drive. A middleware layer is required using Google Drive API.

Flow:

* Connect Google Drive via API
* Fetch files from selected folders
* Extract and process content
* Store embeddings in vector database
* Attach metadata including file links

Example metadata:

```json
{
  "fileName": "DLD Assignment 2",
  "folder": "DLD",
  "type": "assignment",
  "link": "drive_url"
}
```

At query time, the system retrieves relevant data and can return both the answer and the direct Google Drive link to the file.

---

## 9. RAG Data Pipeline

### Step 1 — Upload

Admin uploads file or notice.

### Step 2 — Parsing

Extract text from:

* PDF
* DOCX
* TXT
* images (OCR optional)

### Step 3 — Chunking

Split into 300–500 token chunks.

### Step 4 — Embeddings

Convert chunks into vectors.

### Step 5 — Store

Store vectors + metadata.

Metadata example:

```json
{
  "subject": "DLD",
  "type": "assignment",
  "week": 2,
  "uploaded_by": "CR"
}
```

---

## 10. Query Workflow

```text
Student asks question
        ↓
Embed query
        ↓
Search vector DB
        ↓
Fetch top 3 relevant chunks
        ↓
Send context to Gemini
        ↓
Generate answer
```

---

## 11. Example Use Case

**Query:** Where is Assignment 2 of DLD?

System flow:

1. Convert question into embedding
2. Search stored class data
3. Retrieve matching assignment notice
4. Generate clean answer

Expected output:

> Assignment 2 of DLD is uploaded in LMS under Week 4 resources.

---

## 12. Database Design

### Students Table

* id
* name
* roll_no
* section

### Notices Table

* id
* title
* content
* date

### Files Table

* id
* filename
* subject
* upload_date

### Embeddings Table / Vector Store

* chunk_id
* vector
* metadata

---

## 13. Security & Risk Controls

* admin authentication
* rate limiting
* file validation
* prompt injection protection
* role permissions

Key risk:
Outdated notices causing misinformation.

Mitigation:
Timestamp all answers with latest update source.

---

## 14. Scalability Plan

Phase 1: one class
Phase 2: entire department
Phase 3: university-wide assistant

---

## 15. Future Enhancements

* voice chatbot
* WhatsApp bot integration
* class attendance queries
* auto reminders
* faculty announcements
* quiz generator
* study planner

---

## 16. MVP Timeline

### Week 1

* architecture setup
* UI wireframe

### Week 2

* file upload + parser

### Week 3

* RAG integration

### Week 4

* testing + deployment

---

## 17. Success Metrics

* response accuracy > 90%
* average response time < 3 sec
* CR workload reduced by 70%
* daily active users

---

## 18. Recommended MVP Build Order

1. Chat UI
2. Admin upload
3. vector DB
4. Gemini integration
5. notices search
6. deployment

---

## 19. Final Product Positioning

This is not just a chatbot.
It is a **Class Operating System**.

It should act as the CR’s intelligent digital co-pilot and scale into a campus-level academic assistant.

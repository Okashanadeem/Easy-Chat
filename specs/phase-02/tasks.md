# Phase 2 Tasks: Optimization & Quality

- [x] **T010: Advanced Prompt Engineering**
    - [x] Create a strict System Instruction template (The "Persona").
    - [x] Implement category separation (Applications vs. Definitions).
    - [x] Add confidence indicators and follow-up suggestions.
- [ ] **T011: Context & Memory Management**
    - [ ] Implement conversation history (last 5 turns) for context linking.
    - [ ] Optimize token usage by summarizing history if it exceeds limits.
- [x] **T012: RAG Pipeline Refinement**
    - [x] Improve `chunk_text` logic (Semantic-aware chunking).
    - [x] Implement "Source Metadata" extraction during PDF parsing.
    - [x] Add a re-ranking step or similarity threshold to filter irrelevant chunks.
    - [x] **Add Support for Markdown (.md) and Text (.txt) file uploads.**
- [x] **T013: Response Standardization**
    - [x] Enforce a fixed Markdown hierarchy for all AI outputs.
    - [x] Standardize "Failure Cases" (How to say "I don't know").
    - [x] Implement strict "Answer Only What Is Asked" behavior.

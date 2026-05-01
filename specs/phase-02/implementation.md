# Phase 2 Implementation Details: The "Perfect" Assistant

## 1. The Response Template (System Prompt)
The AI will be instructed to use this strict modular format:
- **🎯 Summary:** 1-sentence direct answer.
- **📖 Explanation:** Segmented by [Definition], [Technique], or [Process].
- **📍 Source:** File name and relevant section.
- **💡 Next Step:** A single follow-up question to guide learning.

## 2. Advanced Chunking Strategy
- **Overlap:** 15% overlap to maintain context between chunks.
- **Cleaning:** Strip headers, footers, and page numbers during extraction to reduce noise.
- **Metadata:** Store `page_number` and `subject` with every chunk.

## 3. Query Handling
- **Paraphrasing:** Use Gemini to "re-write" the query into a search-optimized format before hitting the database.
- **Multi-turn:** Inject the previous turn's topic into the current search query.

## 4. Constraint Enforcement
- No "As an AI..." or "I hope this helps..."
- No unrelated examples.
- If info is missing: "Information not found in class records. Contact CR Okasha."

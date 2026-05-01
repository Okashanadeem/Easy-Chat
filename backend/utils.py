import pypdf
import io
import math
import re
from typing import List

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot_product = sum(x * y for x, y in zip(v1, v2))
    magnitude1 = math.sqrt(sum(x * x for x in v1))
    magnitude2 = math.sqrt(sum(x * x for x in v2))
    if not magnitude1 or not magnitude2:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    pdf_reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for page in pdf_reader.pages:
        page_text = page.extract_text()
        if page_text:
            # 1. Basic normalization: replace multiple spaces/newlines with single ones
            # but try to preserve paragraph structure via \n\n
            lines = page_text.splitlines()
            cleaned_page = ""
            for line in lines:
                line = line.strip()
                if not line: continue
                # Join lines with a space, then we will heal URLs
                cleaned_page += line + " "
            
            # 2. Heal broken URLs (common in PDFs when URLs wrap lines)
            # This regex looks for http followed by URL chars, a space, and a long string of URL chars
            # (at least 10 chars) which is typical for ID continuations but avoids joining short words or list numbers.
            url_pattern = r'(https?://[^\s]+)\s+([a-zA-Z0-9_\-\.\?\&\%=]{10,})'
            
            # Repeat healing a few times to catch multiple breaks in one URL
            for _ in range(3):
                cleaned_page = re.sub(url_pattern, r'\1\2', cleaned_page)
            
            text += cleaned_page.strip() + "\n\n"
    return text

def chunk_text(text: str, chunk_size: int = 700, chunk_overlap: int = 150) -> List[str]:
    # Use paragraph delimiters for cleaner chunks
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        # If a single paragraph is larger than chunk_size, we must split it
        if len(para) > chunk_size:
            # If we have something in current_chunk, flush it
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = ""
            
            # Split the large paragraph into smaller pieces
            start = 0
            while start < len(para):
                end = start + chunk_size
                chunks.append(para[start:end].strip())
                start += chunk_size - chunk_overlap
        
        elif len(current_chunk) + len(para) < chunk_size:
            current_chunk += para + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            # Overlap logic: keep some of the previous if possible, 
            # but for simplicity we just start new chunk
            current_chunk = para + "\n\n"
            
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
        
    return [c for c in chunks if c]

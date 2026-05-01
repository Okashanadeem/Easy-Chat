from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class DocumentChunk(BaseModel):
    text: str
    metadata: dict
    embedding: Optional[List[float]] = None

class ManagedDocument(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    description: str
    user_type: str
    content: str  # Raw text or concatenated PDF text
    created_at: datetime = Field(default_factory=datetime.now)

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    user_type: Optional[str] = None
    content: Optional[str] = None

class Notice(BaseModel):
    title: str
    content: str
    date: datetime = Field(default_factory=datetime.now)
    subject: Optional[str] = None
    type: str = "general"

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class ChatMessage(BaseModel):
    role: str
    content: str

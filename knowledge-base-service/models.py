from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from database import Base
from datetime import datetime

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, index=True)
    filename = Column(String)
    file_type = Column(String)
    file_path = Column(String) # Path to raw file in storage
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending") # pending, processing, completed, failed

    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    content = Column(Text)
    embedding = Column(Vector(768)) # Gemini 1.5 embedding dimension is typically 768
    chunk_index = Column(Integer)

    document = relationship("Document", back_populates="chunks")

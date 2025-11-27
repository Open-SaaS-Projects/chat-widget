import os
from fastapi import UploadFile
import shutil
from pathlib import Path
import PyPDF2
import docx

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

async def save_upload_file(upload_file: UploadFile, project_id: str) -> str:
    project_dir = UPLOAD_DIR / project_id
    project_dir.mkdir(exist_ok=True)
    
    file_path = project_dir / upload_file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return str(file_path)

def extract_text(file_path: str, file_type: str) -> str:
    text = ""
    try:
        if file_type == "application/pdf":
            with open(file_path, "rb") as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                    
        elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
                
        elif file_type in ["text/plain", "text/markdown"]:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
                
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return ""
        
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """
    Simple sliding window chunking. 
    In a real production app, we'd use semantic chunking or a library like LangChain's RecursiveCharacterTextSplitter.
    """
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
        
    return chunks

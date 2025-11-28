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
    Splits text into chunks respecting paragraph and sentence boundaries.
    """
    if not text:
        return []
        
    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size
        
        if end >= text_len:
            chunks.append(text[start:])
            break
            
        # Try to find a paragraph break (double newline)
        last_break = text.rfind('\n\n', start, end)
        if last_break != -1 and last_break > start + chunk_size * 0.5:
            end = last_break + 2
        else:
            # Try to find a sentence break (period followed by space)
            last_period = text.rfind('. ', start, end)
            if last_period != -1 and last_period > start + chunk_size * 0.5:
                end = last_period + 2
            else:
                # Fallback to space
                last_space = text.rfind(' ', start, end)
                if last_space != -1:
                    end = last_space + 1
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        # Move start position back by overlap amount, but don't go behind current start
        start = max(start + 1, end - overlap)
        
    return chunks

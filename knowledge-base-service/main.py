from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_mongo_db, get_qdrant_client
from services.file_processing import save_upload_file, extract_text, chunk_text
from services.scraping import scrape_website
from services.embeddings import generate_embedding, generate_query_embedding
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from pymongo.database import Database
from datetime import datetime
import uuid
import time

app = FastAPI(
    title="Knowledge Base Service",
    description="Microservice for managing files and generating embeddings",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
COLLECTION_NAME = "makkn_knowledge_base"
VECTOR_SIZE = 768 # Gemini 1.5 embedding dimension

@app.on_event("startup")
async def startup_event():
    client = get_qdrant_client()
    try:
        # Check if collection exists
        collections = client.get_collections().collections
        collection_exists = any(col.name == COLLECTION_NAME for col in collections)
        
        if not collection_exists:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=qmodels.VectorParams(size=VECTOR_SIZE, distance=qmodels.Distance.COSINE)
            )
            print(f"Created Qdrant collection: {COLLECTION_NAME}")
        else:
            print(f"Qdrant collection already exists: {COLLECTION_NAME}")
    except Exception as e:
        print(f"Error during startup: {e}")

@app.get("/")
async def root():
    return {"message": "Knowledge Base Service is running (Mongo + Qdrant)"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    mongo_db: Database = Depends(get_mongo_db),
    qdrant: QdrantClient = Depends(get_qdrant_client)
):
    # 1. Save file
    file_path = await save_upload_file(file, project_id)
    
    # 2. Create Document record in MongoDB
    doc_id = str(uuid.uuid4())
    doc_data = {
        "_id": doc_id,
        "project_id": project_id,
        "filename": file.filename,
        "file_type": file.content_type,
        "file_path": file_path,
        "upload_date": datetime.utcnow(),
        "status": "processing"
    }
    mongo_db.documents.insert_one(doc_data)
    
    try:
        # 3. Extract text
        text_content = extract_text(file_path, file.content_type)
        if not text_content:
            raise Exception("Failed to extract text")
            
        # 4. Chunk text
        chunks = chunk_text(text_content)
        
        # 5. Generate embeddings and save chunks to Qdrant
        points = []
        for i, chunk_text_content in enumerate(chunks):
            # Rate limit mitigation for Free Tier
            time.sleep(1)
            
            embedding = generate_embedding(chunk_text_content)
            if embedding:
                point_id = str(uuid.uuid4())
                points.append(qmodels.PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        "document_id": doc_id,
                        "content": chunk_text_content,
                        "project_id": project_id,
                        "chunk_index": i
                    }
                ))
        
        if points:
            qdrant.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
        
        # Update status
        mongo_db.documents.update_one(
            {"_id": doc_id},
            {"$set": {"status": "completed", "chunks_count": len(points)}}
        )
        
        return {"id": doc_id, "status": "completed", "chunks": len(points)}
        
    except Exception as e:
        mongo_db.documents.update_one(
            {"_id": doc_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_knowledge_base(
    query: str = Form(...),
    project_id: str = Form(...),
    limit: int = 5,
    qdrant: QdrantClient = Depends(get_qdrant_client)
):
    # 1. Generate query embedding
    query_embedding = generate_query_embedding(query)
    if not query_embedding:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")
        
    # 2. Perform vector search using Qdrant
    search_result = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,
        query_filter=qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="project_id",
                    match=qmodels.MatchValue(value=project_id)
                )
            ]
        ),
        limit=limit
    )
    
    return [
        {
            "content": hit.payload["content"],
            "document_id": hit.payload["document_id"],
            "similarity": hit.score
        } 
        for hit in search_result
    ]

@app.post("/crawl")
async def crawl_website(
    url: str = Form(...),
    project_id: str = Form(...),
    mongo_db: Database = Depends(get_mongo_db),
    qdrant: QdrantClient = Depends(get_qdrant_client)
):
    # 1. Create Document record in MongoDB
    doc_id = str(uuid.uuid4())
    doc_data = {
        "_id": doc_id,
        "project_id": project_id,
        "filename": url,
        "file_type": "website",
        "file_path": url,
        "upload_date": datetime.utcnow(),
        "status": "processing"
    }
    mongo_db.documents.insert_one(doc_data)
    
    try:
        # 2. Scrape website
        print(f"🌐 Starting scrape for: {url}")
        text_content = scrape_website(url)
        if not text_content:
            raise Exception("Failed to scrape content")
        print(f"📝 Scraped content length: {len(text_content)} characters")
            
        # 3. Chunk text
        print(f"✂️  Starting chunking...")
        chunks = chunk_text(text_content)
        print(f"📦 Created {len(chunks)} chunks")
        
        # 4. Generate embeddings and save chunks to Qdrant
        points = []
        for i, chunk_text_content in enumerate(chunks):
            print(f"🔢 Generating embedding for chunk {i+1}/{len(chunks)}")
            
            # Rate limit mitigation for Free Tier
            time.sleep(1)
            
            embedding = generate_embedding(chunk_text_content)
            if embedding:
                point_id = str(uuid.uuid4())
                points.append(qmodels.PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        "document_id": doc_id,
                        "content": chunk_text_content,
                        "project_id": project_id,
                        "chunk_index": i,
                        "source_type": "website",
                        "url": url
                    }
                ))
            else:
                print(f"⚠️  Failed to generate embedding for chunk {i+1}")
        
        print(f"💾 Upserting {len(points)} points to Qdrant")
        if points:
            qdrant.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
        
        # Update status
        mongo_db.documents.update_one(
            {"_id": doc_id},
            {"$set": {"status": "completed", "chunks_count": len(points)}}
        )
        
        print(f"✅ Crawl completed: {len(points)} chunks stored")
        return {"id": doc_id, "status": "completed", "chunks": len(points)}
        
    except Exception as e:
        mongo_db.documents.update_one(
            {"_id": doc_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents(
    project_id: str,
    mongo_db: Database = Depends(get_mongo_db)
):
    cursor = mongo_db.documents.find({"project_id": project_id}).sort("upload_date", -1)
    documents = []
    for doc in cursor:
        doc["id"] = doc.pop("_id")
        documents.append(doc)
    return documents

@app.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    mongo_db: Database = Depends(get_mongo_db),
    qdrant: QdrantClient = Depends(get_qdrant_client)
):
    # 1. Delete from MongoDB
    result = mongo_db.documents.delete_one({"_id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # 2. Delete vectors from Qdrant
    qdrant.delete(
        collection_name=COLLECTION_NAME,
        points_selector=qmodels.FilterSelector(
            filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="document_id",
                        match=qmodels.MatchValue(value=doc_id)
                    )
                ]
            )
        )
    )
    
    return {"status": "deleted", "id": doc_id}

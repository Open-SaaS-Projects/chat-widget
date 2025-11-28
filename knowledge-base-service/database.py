import os
from pymongo import MongoClient
from qdrant_client import QdrantClient

# MongoDB Connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
mongo_client = MongoClient(MONGO_URL)
mongo_db = mongo_client["makkn_db"]

# Qdrant Connection
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
qdrant_client = QdrantClient(url=QDRANT_URL)

def get_mongo_db():
    return mongo_db

def get_qdrant_client():
    return qdrant_client

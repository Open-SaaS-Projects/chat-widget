import requests
import pymongo
import sys
import time
import json
import os

# Configuration
MONGO_URI = "mongodb://localhost:27017" # Host access to mongo
API_URL = "http://localhost:3000/api" # Host access to frontend API

def print_header(title):
    print(f"\n{'='*50}\n{title}\n{'='*50}")

def print_result(name, success, details=""):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} - {name}")
    if details:
        print(f"   Details: {details}")

def check_mongo_direct():
    print_header("Testing Direct MongoDB Connection")
    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        client.server_info() # Trigger connection
        print_result("Connect to MongoDB (localhost:27017)", True)
        
        db = client["chat-widget"]
        count = db.projects.count_documents({})
        print_result(f"Access 'chat-widget' database (Found {count} projects)", True)
        return True
    except Exception as e:
        print_result("Connect to MongoDB", False, str(e))
        return False

def check_frontend_api_health():
    print_header("Testing Frontend API Routes")
    
    # 1. GET /api/projects
    try:
        response = requests.get(f"{API_URL}/projects", timeout=5)
        if response.status_code == 200:
            data = response.json()
            projects = data.get('projects', [])
            ids = [p.get('id') for p in projects]
            print_result("GET /api/projects (List Projects)", True, f"Status: {response.status_code}, Found: {len(projects)}")
            print(f"   ℹ️  IDs Found in DB: {ids}")
            return True
        else:
            print_result("GET /api/projects", False, f"Status: {response.status_code}, Body: {response.text[:200]}")
            return False
    except Exception as e:
        print_result("GET /api/projects", False, f"Connection Failed: {str(e)}")
        return False

def check_project_creation_flow():
    print_header("Testing Project Creation Flow")
    
    new_project = {
        "name": "Diagnostic Test Project",
        "config": {
            "position": "right",
            "websiteUrl": "https://example.com",
            "colors": {
                "primary": "#6320CE",
                "header": "#6320CE",
                "background": "#ffffff",
                "foreground": "#000000",
                "input": "#e5e7eb"
            },
            "branding": {
                "showChatIcon": True, 
                "showAgentAvatar": True, 
                "showUserAvatar": True,
                "chatIcon": None, "agentIcon": None, "userIcon": None
            },
            "text": {
                "headerTitle": "Test", 
                "welcomeMessage": "Hello", 
                "placeholder": "Type..."
            },
            "persona": {
                "tone": "friendly", 
                "agentType": "general", 
                "responseLength": "medium", 
                "customInstructions": ""
            }
        }
    }

    # CREATE
    project_id = None
    try:
        response = requests.post(f"{API_URL}/projects", json=new_project, timeout=5)
        if response.status_code in [200, 201]:
            data = response.json()
            project = data.get('project')
            if project and project.get('id'):
                project_id = project['id']
                print_result("POST /api/projects (Create)", True, f"Created ID: {project_id}")
            else:
                 print_result("POST /api/projects (Create)", False, "No project ID returned")
        else:
            print_result("POST /api/projects (Create)", False, f"Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        print_result("POST /api/projects (Create)", False, str(e))

    if not project_id:
        print("   Skipping remaining tests due to creation failure.")
        return

    # READ
    try:
        response = requests.get(f"{API_URL}/projects/{project_id}", timeout=5)
        if response.status_code == 200:
            print_result(f"GET /api/projects/{project_id} (Read)", True)
        else:
            print_result(f"GET /api/projects/{project_id} (Read)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_result(f"GET /api/projects/{project_id} (Read)", False, str(e))

    # DELETE
    try:
        response = requests.delete(f"{API_URL}/projects/{project_id}", timeout=5)
        if response.status_code == 200:
            print_result(f"DELETE /api/projects/{project_id}", True)
        else:
            print_result(f"DELETE /api/projects/{project_id}", False, f"Status: {response.status_code}")
    except Exception as e:
        print_result(f"DELETE /api/projects/{project_id}", False, str(e))

if __name__ == "__main__":
    print(f"Starting functionality test for Makkn Chat Widget...")
    print(f"Target: {API_URL}")
    print(f"Mongo: {MONGO_URI}")
    
    mongo_ok = check_mongo_direct()
    if mongo_ok:
        api_ok = check_frontend_api_health()
        if api_ok:
            check_project_creation_flow()
        else:
            print("\n❌ API seems down. Check frontend logs.")
    else:
        print("\n❌ MongoDB seems down. Check mongo container.")

from typing import Dict, Any, Optional, List
from sqlalchemy import create_engine, text, Engine
from sqlalchemy.exc import SQLAlchemyError
from models.db_connection import DatabaseConnection, CreateDatabaseConnectionRequest
from utils.encryption import encrypt_value, decrypt_value
import uuid

# In-memory storage for MVP (Production should use a persistence layer like MongoDB/Postgres)
# Map: project_id -> Connection ID -> DatabaseConnection
_CONNECTIONS_DB: Dict[str, Dict[str, DatabaseConnection]] = {}

# Map: connection_id -> SQLAlchemy Engine
_ENGINE_CACHE: Dict[str, Engine] = {}

class DatabaseService:
    
    def save_connection(self, project_id: str, request: CreateDatabaseConnectionRequest) -> DatabaseConnection:
        """Saves a new database connection config."""
        connection_id = str(uuid.uuid4())
        
        connection = DatabaseConnection(
            project_id=project_id,
            type=request.type,
            name=request.name,
            host=request.host,
            port=request.port,
            username=request.username,
            encrypted_password=encrypt_value(request.password),
            database=request.database,
            ssl_mode=request.ssl_mode
        )
        
        if project_id not in _CONNECTIONS_DB:
            _CONNECTIONS_DB[project_id] = {}
        
        # Store with ID (In real DB, ID is key)
        # We need to attach the ID to the object or store it in a way we can retrieve it.
        # Let's mock the "ID generation" part of a DB
        # Re-creating object to include ID if we added it to model, 
        # but for now let's just use a dict for storage
        _CONNECTIONS_DB[project_id][connection_id] = connection
        
        # Return connection with ID (injecting ID dynamically for this mock)
        # In a real app, the model would have 'id' field
        setattr(connection, 'id', connection_id) 
        return connection

    def get_connections(self, project_id: str) -> List[Dict]:
        """Returns all connections for a project."""
        if project_id not in _CONNECTIONS_DB:
            return []
        
        results = []
        for conn_id, conn in _CONNECTIONS_DB[project_id].items():
            # Return as dict with ID
            data = conn.model_dump()
            data['id'] = conn_id
            data.pop('encrypted_password') # Don't leak this
            results.append(data)
        return results

    def _get_engine(self, connection: DatabaseConnection) -> Engine:
        """Creates or retrieves a cached SQLAlchemy engine."""
        # Use a consistent key for caching. 
        # Note: If config changes, we should invalidate cache. For MVP, we assume immutable config or server restart.
        cache_key = f"{connection.host}:{connection.port}/{connection.database}" 
        
        if cache_key in _ENGINE_CACHE:
            return _ENGINE_CACHE[cache_key]
        
        password = decrypt_value(connection.encrypted_password)
        
        url = ""
        if connection.type == "postgres":
            url = f"postgresql+psycopg2://{connection.username}:{password}@{connection.host}:{connection.port}/{connection.database}"
        elif connection.type == "mysql":
            url = f"mysql+pymysql://{connection.username}:{password}@{connection.host}:{connection.port}/{connection.database}"
        else:
            raise ValueError(f"Unsupported database type: {connection.type}")
            
        try:
            engine = create_engine(url, pool_pre_ping=True, pool_size=5, max_overflow=10)
            _ENGINE_CACHE[cache_key] = engine
            return engine
        except Exception as e:
            print(f"Failed to create engine: {e}")
            raise e

    def test_connection(self, project_id: str, connection_id: str) -> bool:
        """Tests connectivity to the database."""
        conn = self._get_connection_by_id(project_id, connection_id)
        if not conn:
            raise ValueError("Connection not found")
            
        try:
            engine = self._get_engine(conn)
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True
        except Exception as e:
            print(f"Connection test failed: {e}")
            return False

    def execute_named_query(self, project_id: str, connection_id: str, query_template: str, params: Dict[str, Any]) -> List[Dict]:
        """
        Executes a named SQL query with safe parameter binding.
        """
        conn = self._get_connection_by_id(project_id, connection_id)
        if not conn:
            raise ValueError("Connection not found")
            
        try:
            engine = self._get_engine(conn)
            
            # Using text() for safe parameter binding
            statement = text(query_template)
            
            with engine.connect() as connection:
                # Execute and fetch results
                result = connection.execute(statement, params)
                
                # Check if it's a SELECT query (returns rows)
                if result.returns_rows:
                    # Convert rows to list of dicts
                    keys = result.keys()
                    return [dict(zip(keys, row)) for row in result.fetchall()]
                else:
                    # For INSERT/UPDATE/DELETE, return rowcount or success indicator
                    return [{"status": "success", "rows_affected": result.rowcount}]
                    
        except SQLAlchemyError as e:
            print(f"SQL Error: {e}")
            raise ValueError(f"Database execution error: {str(e)}")
        except Exception as e:
            print(f"Generic Error: {e}")
            raise ValueError(f"Execution error: {str(e)}")

    def _get_connection_by_id(self, project_id: str, connection_id: str) -> Optional[DatabaseConnection]:
        if project_id in _CONNECTIONS_DB and connection_id in _CONNECTIONS_DB[project_id]:
            return _CONNECTIONS_DB[project_id][connection_id]
        return None

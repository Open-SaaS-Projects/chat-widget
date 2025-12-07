from cryptography.fernet import Fernet
import os
import base64

# Generate a key if not present (In production, use a consistent key from env)
# For this MVP, we will try to load from ENV, or generate one in memory (warn: memory key is lost on restart)
_ENV_KEY = os.getenv("ENCRYPTION_KEY")

if not _ENV_KEY:
    # Generate a fallback key for development/demo purposes if environment var is missing
    # In a real deployed service, this MUST be persistent, otherwise we can't decrypt saved passwords
    print("WARNING: ENCRYPTION_KEY not found in environment. Using ephemeral key.")
    _KEY = Fernet.generate_key()
else:
    _KEY = _ENV_KEY.encode() if isinstance(_ENV_KEY, str) else _ENV_KEY

cipher_suite = Fernet(_KEY)

def encrypt_value(plaintext: str) -> str:
    """Encrypts a plaintext string."""
    if not plaintext:
        return ""
    encrypted_bytes = cipher_suite.encrypt(plaintext.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')

def decrypt_value(ciphertext: str) -> str:
    """Decrypts a ciphertext string."""
    if not ciphertext:
        return ""
    try:
        decrypted_bytes = cipher_suite.decrypt(ciphertext.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        print(f"Decryption error: {e}")
        return ""

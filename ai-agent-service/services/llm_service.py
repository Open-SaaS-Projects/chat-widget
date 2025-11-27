from litellm import completion
import os
from typing import List, Dict, Any, AsyncGenerator

# Configure LiteLLM
os.environ["GEMINI_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")
MODEL_NAME = os.getenv("LITELLM_MODEL", "gemini/gemini-2.5-flash")

class LLMService:
    def _construct_system_prompt(self, context_chunks: List[Dict[str, Any]]) -> str:
        """
        Construct the system prompt with retrieved context.
        """
        base_prompt = """You are a helpful and intelligent AI customer support agent for MAKKN.
Your goal is to answer user questions accurately based ONLY on the provided context.
If the answer is not in the context, politely state that you don't have that information.
Do not make up answers.

Context:
"""
        context_text = "\n\n".join([f"- {chunk['content']}" for chunk in context_chunks])
        
        return f"{base_prompt}\n{context_text}"

    async def generate_response(self, query: str, context_chunks: List[Dict[str, Any]], history: List[Dict[str, str]] = []) -> str:
        """
        Generate a response using LiteLLM (Gemini).
        """
        system_prompt = self._construct_system_prompt(context_chunks)
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (limited to last 5 turns to save tokens)
        messages.extend(history[-10:])
        
        # Add current user query
        messages.append({"role": "user", "content": query})

        try:
            response = completion(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I apologize, but I'm having trouble processing your request right now."

    async def generate_stream_response(self, query: str, context_chunks: List[Dict[str, Any]], history: List[Dict[str, str]] = []) -> AsyncGenerator[str, None]:
        """
        Generate a streaming response using LiteLLM.
        """
        system_prompt = self._construct_system_prompt(context_chunks)
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history[-10:])
        messages.append({"role": "user", "content": query})

        try:
            response = completion(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.7,
                stream=True
            )
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            print(f"Error generating stream: {e}")
            yield "I apologize, but I'm having trouble processing your request right now."

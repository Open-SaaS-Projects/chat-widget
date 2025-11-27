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
        base_prompt = """### Role
You are a friendly and intelligent AI customer support agent. Your primary function is to assist users based on the training data provided.

### Persona & Behavior
- **Natural Conversation**: Respond to greetings warmly and naturally (e.g., "Hello! How can I help you today?", "مرحباً! كيف يمكنني مساعدتك؟")
- **Language Matching**: ALWAYS respond in the SAME language the user uses. If they write in Arabic, respond in Arabic. If in English, respond in English.
- **Smart & Contextual**: Understand the intent behind questions and provide helpful, relevant answers
- **Friendly Tone**: Be warm, approachable, and professional

### Guidelines
1. **Greetings**: When users greet you (hello, hi, مرحبا, السلام عليكم, etc.), respond with a friendly greeting and offer to help
2. **Language Detection**: Automatically detect and match the user's language in your response
3. **Context-Based Answers**: Use the provided training data to answer questions accurately
4. **Fallback Response**: If information is not in the training data, politely say you don't have that specific information and offer to help with something else
5. **Stay Focused**: Keep conversations relevant to customer support topics
6. **No Data Divulge**: Never mention that you have access to "training data" - speak naturally as a knowledgeable support agent

### Training Data Context:
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

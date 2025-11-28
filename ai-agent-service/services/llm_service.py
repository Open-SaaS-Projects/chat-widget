from litellm import completion
import os
from typing import List, Dict, Any, AsyncGenerator, Optional
from services.persona_builder import PersonaBuilder

# Configure LiteLLM
os.environ["GEMINI_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")
MODEL_NAME = os.getenv("LITELLM_MODEL", "gemini/gemini-2.5-flash")

class LLMService:
    def _construct_system_prompt(self, context_chunks: List[Dict[str, Any]], persona_config: Dict[str, str] = None) -> str:
        """
        Construct the system prompt with retrieved context and persona settings.
        """
        if not persona_config:
            persona_config = {}
            
        base_prompt = PersonaBuilder.build_system_prompt(
            tone=persona_config.get("tone", "friendly"),
            agent_type=persona_config.get("agentType", "general"),
            response_length=persona_config.get("responseLength", "medium"),
            custom_instructions=persona_config.get("customInstructions", "")
        )
        
        print(f"🤖 Generated System Prompt:\n{base_prompt}")
        
        context_text = "\n\n".join([f"- {chunk['content']}" for chunk in context_chunks])
        
        # Get response length instruction for final reminder
        length_reminder = PersonaBuilder.RESPONSE_LENGTH_INSTRUCTIONS.get(
            persona_config.get("responseLength", "medium"),
            PersonaBuilder.RESPONSE_LENGTH_INSTRUCTIONS["medium"]
        )
        
        return f"{base_prompt}\n### Training Data Context:\n{context_text}\n\n=== CRITICAL FINAL INSTRUCTION ===\n{length_reminder}\n\nREMINDER: You MUST stay in character as defined by your Role and Tone above."

    async def generate_response(self, query: str, context_chunks: List[Dict[str, Any]], history: List[Dict[str, str]] = [], persona_config: Dict[str, str] = None) -> str:
        """
        Generate a response using LiteLLM (Gemini).
        """
        system_prompt = self._construct_system_prompt(context_chunks, persona_config)
        
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

    async def generate_stream_response(self, query: str, context_chunks: List[Dict[str, Any]], history: List[Dict[str, str]] = [], persona_config: Dict[str, str] = None) -> AsyncGenerator[str, None]:
        """
        Generate a streaming response using LiteLLM.
        """
        system_prompt = self._construct_system_prompt(context_chunks, persona_config)
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

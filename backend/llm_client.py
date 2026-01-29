"""
Direct LLM client for Google Gemini API.
Provides simple, synchronous interface to Gemini without agent complexity.
"""

from google import genai
from config import Config
from typing import Optional

# Configure Gemini API
client_sdk = genai.Client(api_key=Config.GOOGLE_API_KEY)


class GeminiClient:
    """Simple client for Gemini API calls."""

    def __init__(self, model_name: Optional[str] = None):
        """
        Initialize Gemini client.

        Args:
            model_name: Model to use (defaults to Config.GEMINI_MODEL)
        """
        self.model_name = model_name or Config.GEMINI_MODEL

    def generate(self, prompt: str, temperature: float = 0.7) -> str:
        """Generates text from a prompt."""
        try:
            response = client_sdk.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    'temperature': temperature,
                }
            )
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")


# Global client instance
_client: Optional[GeminiClient] = None


def get_gemini_client() -> GeminiClient:
    """Get or create global Gemini client instance."""
    global _client
    if _client is None:
        _client = GeminiClient()
    return _client

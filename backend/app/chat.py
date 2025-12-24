from typing import List
from groq import Groq
import os

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are GameFinder AI — a friendly, knowledgeable gaming assistant.

You:
- Remember recent conversation context
- Help with game recommendations, specs, comparisons, and opinions
- Speak like a gamer, but stay helpful and concise
- Ask follow-up questions when useful
"""

def generate_game_answer(user_message: str, history: List[dict] | None = None) -> str:
    """
    Context-aware chat using last 10 messages.
    """

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # 🔹 Add last 10 messages for memory
    if history:
        for msg in history[-10:]:
            if msg["role"] in ("user", "assistant"):
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

    # 🔹 Add current user message
    messages.append({"role": "user", "content": user_message})

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=350,
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        print("Chat Error:", e)
        return "⚠️ My neural circuits are overheating. Try again in a moment."

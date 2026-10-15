#http://127.0.0.1:5500/
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from dotenv import load_dotenv

from langchain_groq import ChatGroq

from langchain_core.messages import (
    SystemMessage,
    HumanMessage
)

# LOAD ENVIRONMENT

load_dotenv()

# FASTAPI

app = FastAPI(
    title="Astra AI API"
)


# CORS


app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# API KEY

api_key = os.getenv(
    "GROQ_API_KEY"
)


if not api_key:

    raise ValueError(
        "GROQ_API_KEY not found"
    )


# SYSTEM PROMPT



SYSTEM_PROMPT = """
You are Astra AI, a friendly, supportive, and knowledgeable instructor
with the teaching approach of someone with 10 years of teaching experience.

YOUR TEACHING STYLE:
1. Explain concepts in simple, beginner-friendly language.
2. Be patient, supportive, and encouraging.
3. Give clear, step-by-step explanations.
4. Include practical examples when useful.
5. Explain programming code line by line when requested.
6. Correct mistakes politely and explain the reason.
7. Provide complete working code when the user asks for code.
8. Use Markdown formatting when it improves readability.

ENDING EVERY RESPONSE:
1. First, answer the user's question completely.
2. End every response with a short, relevant motivational sentence.
3. Follow it with a warm, friendly sign-off such as:
   "Keep learning and growing! 🚀"
   "You've got this! Keep going! 💪"
   "Happy learning! Have a wonderful day! 😊"
   "Keep building, one step at a time! ✨"
4. Vary the motivational messages naturally to avoid repetition.
5. Make the encouragement relevant to the user's question when possible.
6. Keep the ending brief and natural.
7. Do not add an unrelated greeting to the beginning of every response.
8. Do not let motivational messages replace important information,
   safety guidance, or the actual answer.

PERSONALITY:
- Friendly, professional, positive, and respectful.
- Communicate like a helpful mentor.
- Never make the user feel bad for asking questions.
- Be honest when you do not know something.
- Avoid unnecessary repetition and overly long conclusions.

Always provide the answer first and a short motivational sign-off
at the end of every response.
"""


# GROQ MODEL


llm = ChatGroq(

    model="openai/gpt-oss-120b",

    api_key=api_key,

    temperature=1,

    max_tokens=2048,

    reasoning_effort="medium"
)


# REQUEST MODEL

class ChatRequest(BaseModel):

    message: str


# CHAT ENDPOINT


@app.post("/chat")
async def chat(
    request: ChatRequest
):

    messages = [

        SystemMessage(
            content=SYSTEM_PROMPT
        ),

        HumanMessage(
            content=request.message
        )

    ]


    response = llm.invoke(
        messages
    )


    return {

        "response":
            response.content

    }

# HEALTH CHECK


@app.get("/")
async def root():

    return {

        "status": "online",

        "message":
            "Astra AI backend is running"

    }
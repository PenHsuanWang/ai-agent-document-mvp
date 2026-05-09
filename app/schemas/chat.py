"""Pydantic request / response schemas for the chat API.

These are Presentation-layer contracts.  They must NOT be imported by the
Domain or Application layers (dependency direction: inward only).
"""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    session_id: str = Field(
        ...,
        description="Unique conversation identifier.  Reuse the same ID across "
        "turns to maintain conversation history.",
        examples=["user-123-session-abc"],
    )
    user_message: str = Field(
        ...,
        min_length=1,
        max_length=8192,
        description="The user's natural language prompt or question.",
        examples=["Please summarize sample_report.txt"],
    )


class ChatResponse(BaseModel):
    response: str = Field(..., description="Claude's final answer.")
    status: str = Field(
        default="success",
        description="'success' on a normal completion, 'error' if the agent loop failed.",
    )

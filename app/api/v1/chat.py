"""POST /api/v1/chat — conversation endpoint (Presentation layer).

Responsibilities of this handler (and nothing more):
1. Deserialise the incoming request via Pydantic.
2. Load / create the session from the store.
3. Append the user message to the session.
4. Delegate to AgentService (Application layer).
5. Persist the updated session.
6. Serialise and return the response.

All business logic and LLM orchestration lives in AgentService — this handler
is intentionally kept thin (Single Responsibility Principle).
"""

import logging

from fastapi import APIRouter

from app.domain.exceptions import AgentError
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.agent import agent_service
from app.services.memory import session_store

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message to the AI Agent",
    description=(
        "Submit a natural language message.  The agent will autonomously decide "
        "which local-file tools to call, loop until it has enough context, and "
        "return a final summarised answer."
    ),
)
async def chat(request: ChatRequest) -> ChatResponse:
    logger.info("Chat request | session='%s' | message='%.80s...'",
                request.session_id, request.user_message)

    try:
        session = session_store.get_or_create(request.session_id)
        session.add_user_message(request.user_message)

        answer = await agent_service.run(session)

        session_store.save(session)
        logger.info("Chat success | session='%s'", request.session_id)
        return ChatResponse(response=answer, status="success")

    except AgentError as exc:
        # Known, typed domain errors — log as warning, return a user-safe message.
        logger.warning("Agent error for session '%s': %s", request.session_id, exc)
        return ChatResponse(
            response="The agent encountered an error and could not complete your request.",
            status="error",
        )
    except Exception as exc:  # noqa: BLE001
        # Unexpected errors — log with full traceback, never expose internals.
        logger.error(
            "Unhandled error for session '%s': %s",
            request.session_id,
            exc,
            exc_info=True,
        )
        return ChatResponse(
            response="An unexpected internal error occurred. Please try again.",
            status="error",
        )

"""AgentService — Application layer orchestrating the agentic loop.

This module is the core of the system.  It implements the "manual tool_runner"
pattern: call Claude → check stop_reason → execute tool if needed → loop until
the model issues end_turn with a final text answer.

Design highlights:

- AgentService has no knowledge of HTTP, sessions stores, or file systems.
  It receives an AgentSession (domain object) and returns a string.
- All message history mutations happen here so the API handler stays clean.
- The Anthropic client is initialised once at module load via dependency
  injection through Settings (not instantiated inside business logic).
"""

import logging
from typing import Any

from anthropic import AsyncAnthropic
from anthropic.types import Message

from app.core.config import settings
from app.domain.exceptions import AgentLoopError
from app.domain.models import AgentSession
from app.services.tools import TOOL_DEFINITIONS, execute_tool

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────── #
# Anthropic client — single instance per process (connection pooling)          #
# ──────────────────────────────────────────────────────────────────────────── #
_client = AsyncAnthropic(
    api_key=settings.anthropic_api_key.get_secret_value(),
    base_url=settings.anthropic_base_url,  # None → default Anthropic endpoint
    max_retries=settings.max_retries,
)

# Safety cap: prevent runaway loops on edge-case model behaviour.
_MAX_LOOP_ITERATIONS = 10


def _extract_text(message: Message) -> str:
    """Pull the first TextBlock from a completed Claude response."""
    for block in message.content:
        if hasattr(block, "text"):
            return block.text
    return ""


def _serialize_content(content: Any) -> Any:
    """Convert Anthropic SDK content blocks to JSON-serialisable dicts.

    The SDK ContentBlock objects are Pydantic models; model_dump() produces a
    plain dict that can be safely stored and re-submitted in subsequent turns.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return [
            block.model_dump() if hasattr(block, "model_dump") else block
            for block in content
        ]
    return content


class AgentService:
    """Orchestrates the Claude agentic loop for a single user turn."""

    async def run(self, session: AgentSession) -> str:
        """Drive the tool-use loop until Claude returns a final text answer.

        Args:
            session: An AgentSession whose ``messages`` list already contains
                     the user's current message as the last entry.

        Returns:
            The final natural language answer from Claude.

        Raises:
            AgentLoopError: If the loop exceeds the safety cap or terminates
                            in an unexpected state.
        """
        for iteration in range(_MAX_LOOP_ITERATIONS):
            logger.debug("Agent loop iteration %d for session '%s'", iteration, session.session_id)

            response: Message = await _client.messages.create(
                model=settings.claude_model,
                max_tokens=settings.max_tokens,
                tools=TOOL_DEFINITIONS,
                messages=session.messages,
            )

            logger.debug("Claude stop_reason=%s", response.stop_reason)

            # ── Case 1: Final answer ──────────────────────────────────────── #
            if response.stop_reason == "end_turn":
                final_text = _extract_text(response)
                # Persist final assistant turn to session history.
                session.add_assistant_message(_serialize_content(response.content))
                return final_text

            # ── Case 2: Tool call(s) requested ────────────────────────────── #
            if response.stop_reason == "tool_use":
                # Record the assistant turn (with tool_use blocks) in history.
                session.add_assistant_message(_serialize_content(response.content))

                # Execute every tool the model requested in this iteration.
                tool_results: list[dict[str, Any]] = []
                for block in response.content:
                    if block.type == "tool_use":
                        logger.info(
                            "Executing tool '%s' with input: %s",
                            block.name,
                            block.input,
                        )
                        result = execute_tool(block.name, dict(block.input))
                        tool_results.append(
                            {
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": result,
                            }
                        )

                # Feed all results back to Claude in a single user turn.
                session.add_tool_results(tool_results)
                continue

            # ── Unexpected stop_reason ────────────────────────────────────── #
            logger.warning("Unexpected stop_reason '%s', aborting loop.", response.stop_reason)
            raise AgentLoopError(
                f"Unexpected stop_reason '{response.stop_reason}' from Claude."
            )

        raise AgentLoopError(
            f"Agent loop exceeded the maximum of {_MAX_LOOP_ITERATIONS} iterations."
        )


# Module-level singleton — import and use directly in API handlers.
agent_service = AgentService()

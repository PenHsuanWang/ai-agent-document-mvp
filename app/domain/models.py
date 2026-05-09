"""Core domain entities.

This module has ZERO external dependencies (Clean Architecture — Domain Layer).
All business concepts are expressed as plain Python dataclasses.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class AgentSession:
    """Represents a single user conversation thread.

    ``messages`` follows the Anthropic API format:
      [{"role": "user" | "assistant", "content": str | list[ContentBlock]}, ...]

    Content blocks may be plain strings, Anthropic SDK objects, or their dict
    representations — the SDK handles serialisation transparently.
    """

    session_id: str
    messages: list[dict[str, Any]] = field(default_factory=list)

    # ------------------------------------------------------------------ #
    # Mutation helpers — keep all message-building logic in one place      #
    # ------------------------------------------------------------------ #

    def add_user_message(self, content: str) -> None:
        self.messages.append({"role": "user", "content": content})

    def add_assistant_message(self, content: Any) -> None:
        """Accept either a plain string or a list of Anthropic ContentBlocks."""
        self.messages.append({"role": "assistant", "content": content})

    def add_tool_results(self, tool_results: list[dict[str, Any]]) -> None:
        """Wrap tool results in a ``user`` turn as required by the Anthropic API."""
        self.messages.append({"role": "user", "content": tool_results})

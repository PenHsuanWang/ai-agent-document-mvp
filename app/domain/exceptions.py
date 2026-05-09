"""Typed domain error hierarchy.

Inner layers raise these typed errors; the Presentation layer catches and
maps them to appropriate HTTP responses.  Never expose raw stack traces.
"""


class AgentError(Exception):
    """Base error for all agent domain failures."""


class ToolSecurityError(AgentError):
    """A tool call violated path-traversal security constraints."""


class ToolExecutionError(AgentError):
    """A tool failed during execution (non-recoverable at service level)."""


class SessionNotFoundError(AgentError):
    """Requested session_id does not exist in the store."""


class AgentLoopError(AgentError):
    """The agentic loop terminated in an unexpected state."""

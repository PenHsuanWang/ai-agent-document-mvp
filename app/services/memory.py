"""In-memory session store (Infrastructure layer).

Implements the session persistence contract for the MVP.  Because this is
isolated behind a clear interface, swapping to a Redis or PostgreSQL backend
in a future iteration requires only replacing this module — the AgentService
remains untouched (Dependency Inversion Principle).

Thread-safety note: a single-worker uvicorn process is effectively
single-threaded for asyncio coroutines, so a plain dict is safe for MVP.
For multi-worker deployments, replace with a Redis-backed store.
"""

from app.domain.models import AgentSession


class InMemorySessionStore:
    """Key-value store mapping session_id → AgentSession."""

    def __init__(self) -> None:
        self._store: dict[str, AgentSession] = {}

    def get_or_create(self, session_id: str) -> AgentSession:
        """Return an existing session or create a fresh one."""
        if session_id not in self._store:
            self._store[session_id] = AgentSession(session_id=session_id)
        return self._store[session_id]

    def save(self, session: AgentSession) -> None:
        self._store[session.session_id] = session

    def delete(self, session_id: str) -> None:
        self._store.pop(session_id, None)

    @property
    def active_sessions(self) -> int:
        return len(self._store)


# Module-level singleton shared across all requests within a process lifetime.
session_store = InMemorySessionStore()

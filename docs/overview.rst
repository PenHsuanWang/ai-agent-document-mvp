Project Overview
================

Architecture
------------

The project follows **Clean Architecture** with a strict inward dependency rule:

* **Presentation layer** — ``app/api/`` — thin FastAPI routers that delegate to services.
* **Application layer** — ``app/services/`` — the agentic loop, tool executor, and session memory.
* **Domain layer** — ``app/domain/`` — pure Python models and exceptions; zero external dependencies.
* **Infrastructure layer** — ``app/core/`` — settings, secrets, and cross-cutting concerns.

Agentic Loop
------------

The agent loop in :mod:`app.services.agent` orchestrates the following cycle:

1. Append the user message to the conversation history.
2. Call the Claude API; receive a response that may contain ``tool_use`` blocks.
3. Execute the requested tool(s) from :mod:`app.services.tools`.
4. Feed ``tool_result`` blocks back to Claude and repeat until ``end_turn``.

Development Commands
--------------------

.. code-block:: bash

   # Install runtime + dev dependencies
   uv sync --extra dev

   # Install documentation dependencies
   uv sync --extra docs

   # Run the API server (hot-reload)
   uv run uvicorn app.main:app --reload --port 8000

   # Build HTML docs
   cd docs && make html

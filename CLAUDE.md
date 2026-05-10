# AI Agent MVP — Local File Reader & Summarizer

## Project Overview
This is a lightweight, highly reliable AI Agent backend based on FastAPI and the Claude API (Anthropic Python SDK). The core capability is exploring, reading, and summarizing documents within a specific sandboxed local folder (`./local_data/`). 

## Architecture & Design Principles
- **Separation of Concerns**: Tools are strictly for "data retrieval" (reading files). The LLM (Claude) handles all "reasoning and summarization". Tools do NOT summarize.
- **The Agentic Loop**: Handled manually in `app/services/agent.py`. It calls Claude, intercepts `tool_use` requests, executes Python tools locally, and feeds the `tool_result` back to Claude in a loop until `end_turn`.
- **Stateless Tools**: Tools are pure functions. Conversation state is managed via an in-memory `AgentSession` (`app/services/memory.py`).
- **Graceful Error Handling**: Tools MUST NOT raise exceptions. Exceptions (like `FileNotFoundError`) must be caught and returned as a plain string starting with `"Error: "`. This allows Claude to read the error and self-correct (e.g., fix a typo in a filename).
- **Security (Path Traversal)**: `read_local_document` uses `pathlib.Path.resolve()` to strictly enforce that accessed files reside within the `./local_data/` directory.

## Development Commands
- **Install dependencies**: `uv sync`
- **Run local server**: `uv run uvicorn app.main:app --reload --port 8000`

## Coding Standards
- **Python 3.12+ Typing**: Use modern generics (`list[str]`, `dict[str, Any]`, `int | None`). Do not use `typing.List` or `typing.Optional`.
- **Clean Architecture**: Keep dependencies inward. `app/domain` has zero external dependencies. `app/api/v1/chat.py` is intentionally thin and delegates business logic to `AgentService`.
- **Secrets Management**: Use `pydantic-settings` (`SecretStr`) in `app/core/config.py`. Never hardcode keys or expose them in logs.
- **Tools Addition**: To add a new tool, define the function in `app/services/tools.py`, add its JSON Schema to `TOOL_DEFINITIONS`, and map it in `TOOL_REGISTRY`. Do not modify `agent.py`.

## Core Files
- `app/api/v1/chat.py`: FastAPI endpoint `POST /api/v1/chat`.
- `app/services/agent.py`: The main recursive Agent loop orchestrating Anthropic SDK and tools.
- `app/services/tools.py`: Python implementations of `list_local_documents` and `read_local_document`.
- `app/services/memory.py`: In-memory dictionary managing `session_id` mapping.
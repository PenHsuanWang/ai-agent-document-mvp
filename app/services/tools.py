"""Local filesystem tool definitions (Infrastructure layer).

Design principles enforced here:
- Tools NEVER raise exceptions — all errors are returned as "Error: ..." strings
  so Claude can self-correct without crashing the agent loop.
- Path security: every file access is validated with pathlib.Path.resolve() to
  prevent directory traversal attacks (e.g., file_name = "../../../etc/passwd").
- Single Responsibility: each function does one thing only.
- Open/Closed (tool registry): adding a new tool means adding one function and
  one entry in TOOL_DEFINITIONS + TOOL_REGISTRY — AgentService is never touched.
"""

import logging
from pathlib import Path
from typing import Any, Callable

from app.core.config import settings

logger = logging.getLogger(__name__)

# Resolved once at import time; guaranteed to be an absolute path.
DOCS_DIR: Path = Path(settings.local_data_dir).resolve()
DOCS_DIR.mkdir(parents=True, exist_ok=True)


# ──────────────────────────────────────────────────────────────────────────── #
# Tool implementations                                                          #
# ──────────────────────────────────────────────────────────────────────────── #


def list_local_documents() -> str:
    """Return a newline-separated list of all files in the sandboxed folder."""
    try:
        files = sorted(f.name for f in DOCS_DIR.iterdir() if f.is_file())
        if not files:
            return "The local_data directory is empty — no documents are available."
        return "Available documents:\n" + "\n".join(f"- {name}" for name in files)
    except Exception as exc:
        logger.error("list_local_documents failed: %s", exc, exc_info=True)
        return f"Error: Could not read the documents directory — {exc}"


def read_local_document(file_name: str) -> str:
    """Return the full UTF-8 text content of *file_name*, or an error string."""
    # ── Security: prevent directory traversal ─────────────────────────────── #
    try:
        requested = (DOCS_DIR / file_name).resolve()
    except Exception:
        return f"Error: '{file_name}' is not a valid file name."

    if DOCS_DIR not in requested.parents and requested != DOCS_DIR:
        # The resolved path escapes the sandbox — block immediately.
        logger.warning("Directory traversal attempt blocked: %s", file_name)
        return (
            f"Error: Access denied for '{file_name}'. "
            f"Only files inside the '{DOCS_DIR.name}' folder may be read."
        )

    # ── Existence checks ──────────────────────────────────────────────────── #
    if not requested.exists():
        return (
            f"Error: File '{file_name}' was not found. "
            "Call list_local_documents first to see what files are available."
        )
    if not requested.is_file():
        return f"Error: '{file_name}' is a directory, not a file."

    # ── Read ──────────────────────────────────────────────────────────────── #
    try:
        content = requested.read_text(encoding="utf-8")
        logger.info("Read file '%s' (%d chars)", file_name, len(content))
        return content
    except UnicodeDecodeError:
        return (
            f"Error: '{file_name}' cannot be read as UTF-8 text. "
            "The MVP only supports plain-text files (.txt, .md, .csv)."
        )
    except Exception as exc:
        logger.error("read_local_document('%s') failed: %s", file_name, exc, exc_info=True)
        return f"Error: Unexpected error reading '{file_name}' — {exc}"


# ──────────────────────────────────────────────────────────────────────────── #
# Anthropic tool schemas (JSON Schema format for the messages.create() call)   #
# ──────────────────────────────────────────────────────────────────────────── #

TOOL_DEFINITIONS: list[dict[str, Any]] = [
    {
        "name": "list_local_documents",
        "description": (
            "Lists all available document file names in the local knowledge base "
            "(the local_data folder). "
            "Call this tool FIRST when the user asks what documents are available, "
            "or whenever you need to discover file names before reading them."
        ),
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "read_local_document",
        "description": (
            "Reads the complete text content of a specific document from the local "
            "knowledge base. Call this when you need the actual content of a file "
            "to answer a question or produce a summary. "
            "Always use list_local_documents first if you are unsure of the exact file name."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "file_name": {
                    "type": "string",
                    "description": (
                        "The exact name of the file to read, including its extension "
                        "(e.g., 'report.txt', 'data.md', 'sales.csv')."
                    ),
                }
            },
            "required": ["file_name"],
        },
    },
]

# ──────────────────────────────────────────────────────────────────────────── #
# Tool registry — maps tool names → callables.                                 #
# To add a new tool: implement a function above, add its schema to             #
# TOOL_DEFINITIONS, and register it here.  Nothing else needs to change.       #
# ──────────────────────────────────────────────────────────────────────────── #

TOOL_REGISTRY: dict[str, Callable[..., str]] = {
    "list_local_documents": lambda _inp: list_local_documents(),
    "read_local_document": lambda inp: read_local_document(inp["file_name"]),
}


def execute_tool(tool_name: str, tool_input: dict[str, Any]) -> str:
    """Dispatch a tool call by name and return its string result."""
    handler = TOOL_REGISTRY.get(tool_name)
    if handler is None:
        logger.error("Unknown tool requested: %s", tool_name)
        return f"Error: Unknown tool '{tool_name}'. Available tools: {list(TOOL_REGISTRY)}"
    return handler(tool_input)

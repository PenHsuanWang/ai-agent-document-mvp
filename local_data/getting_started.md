# Getting Started with the AI Agent MVP

Welcome! This document describes how to interact with the **Local File Reader & Summarizer AI Agent**.

## What Can This Agent Do?

The agent can:
- **Discover** documents available in its local knowledge base.
- **Read** the content of specific plain-text files (`.txt`, `.md`, `.csv`).
- **Summarize** or **answer questions** about those documents using Claude's reasoning.

## Example Prompts

| Goal | Example Message |
|------|----------------|
| Discover available files | `"What documents do you have access to?"` |
| Summarize a specific file | `"Please summarize the sample_report.txt"` |
| Ask a question | `"What was the Q1 2026 revenue and which region exceeded its target?"` |
| General query | `"Based on the available documents, what are the key risks mentioned?"` |

## How the Agent Works

1. You send a message to `POST /api/v1/chat`.
2. The backend passes your message and a list of available tools to Claude.
3. Claude decides whether to call a tool (e.g., `list_local_documents` or `read_local_document`).
4. Tools are executed on the server; results are fed back to Claude.
5. Claude loops until it has enough information, then returns a final answer.

## File Support

The MVP supports plain-text files only:
- `.txt` — Plain text
- `.md`  — Markdown
- `.csv` — Comma-separated values

Binary files (PDFs, images, Word documents) are **not supported** in this MVP phase.

## Security

All file access is restricted to the `local_data/` directory. The agent cannot read files
outside this sandbox, even if explicitly instructed to do so.

## API Reference

```
POST /api/v1/chat

Request body:
{
  "session_id": "unique-session-identifier",
  "user_message": "your question or command"
}

Response:
{
  "response": "Claude's final answer",
  "status": "success"
}
```

Each `session_id` maintains its own conversation history in memory for multi-turn dialogue.

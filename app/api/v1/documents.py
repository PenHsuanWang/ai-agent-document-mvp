"""Document management API — upload and delete local documents.

Endpoints:
  GET    /api/v1/documents              — list all documents
  POST   /api/v1/documents              — upload a new document (no overwrite)
  DELETE /api/v1/documents/{filename}   — delete an existing document

Design constraints (by intent):
- Documents are **immutable** once uploaded; there is no edit/overwrite endpoint.
- Only plain-text files are accepted (.txt, .md, .csv).
- All file paths are resolved with pathlib to block directory traversal attacks.
"""

import logging
import re

from fastapi import APIRouter, HTTPException, UploadFile, status

from app.schemas.documents import DeleteResponse, ListResponse, UploadResponse
from app.services.tools import DOCS_DIR

router = APIRouter()
logger = logging.getLogger(__name__)

# Allowlist: alphanumeric, dash, underscore, dot — no slashes or special chars.
_SAFE_FILENAME_RE = re.compile(r"^[a-zA-Z0-9_\-][a-zA-Z0-9_\-. ]*$")

# Only plain-text extensions the agent can actually read.
_ALLOWED_EXTENSIONS = {".txt", ".md", ".csv"}


def _validate_filename(filename: str) -> str:
    """Sanitise and validate a filename; raise HTTPException on failure.

    Returns the cleaned filename (basename only, no directory components).
    """
    # Strip any path components a client might smuggle in.
    from pathlib import PurePosixPath
    safe_name = PurePosixPath(filename).name

    if not safe_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename must not be empty.",
        )

    if not _SAFE_FILENAME_RE.match(safe_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Filename '{safe_name}' contains invalid characters. "
                "Use only letters, numbers, dashes, underscores, and dots."
            ),
        )

    from pathlib import Path
    ext = Path(safe_name).suffix.lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Extension '{ext}' is not supported. "
                f"Allowed types: {sorted(_ALLOWED_EXTENSIONS)}"
            ),
        )

    return safe_name


def _resolve_safe(filename: str):
    """Resolve the target path and assert it stays inside DOCS_DIR."""
    from pathlib import Path
    target = (DOCS_DIR / filename).resolve()
    # Guard against any remaining traversal edge-cases after sanitisation.
    if DOCS_DIR not in target.parents and target != DOCS_DIR:
        logger.warning("Traversal blocked in documents API: %s", filename)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Access denied: path escapes the documents directory.",
        )
    return target


@router.get(
    "",
    response_model=ListResponse,
    summary="List all available documents",
)
async def list_documents() -> ListResponse:
    """Return a sorted list of every file currently in the documents store."""
    files = sorted(f.name for f in DOCS_DIR.iterdir() if f.is_file())
    return ListResponse(documents=files, total=len(files))


@router.post(
    "",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a new document",
    description=(
        "Upload a plain-text file (.txt, .md, .csv) to the local documents store. "
        "Documents are **immutable** — uploading a file that already exists is rejected "
        "to preserve data integrity. Delete the existing file first if a replacement is needed."
    ),
)
async def upload_document(file: UploadFile) -> UploadResponse:
    original_name = file.filename or ""
    safe_name = _validate_filename(original_name)
    target = _resolve_safe(safe_name)

    if target.exists():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Document '{safe_name}' already exists. "
                "Delete it first if you need to replace it."
            ),
        )

    try:
        content = await file.read()
        # Enforce UTF-8 so the agent can always read the file back.
        content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File must be valid UTF-8 encoded text.",
        )

    target.write_bytes(content)
    logger.info("Document uploaded: '%s' (%d bytes)", safe_name, len(content))
    return UploadResponse(filename=safe_name, size_bytes=len(content))


@router.delete(
    "/{filename}",
    response_model=DeleteResponse,
    summary="Delete a document",
    description="Permanently remove a document from the local documents store.",
)
async def delete_document(filename: str) -> DeleteResponse:
    safe_name = _validate_filename(filename)
    target = _resolve_safe(safe_name)

    if not target.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{safe_name}' not found.",
        )
    if not target.is_file():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{safe_name}' is not a file.",
        )

    target.unlink()
    logger.info("Document deleted: '%s'", safe_name)
    return DeleteResponse(filename=safe_name)

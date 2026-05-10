"""Sphinx configuration for the AI Agent MVP documentation."""

import os
import sys

# Make the project importable so autodoc can introspect modules.
sys.path.insert(0, os.path.abspath(".."))

# Provide a placeholder API key so pydantic-settings can instantiate Settings
# without a real .env file present during the docs build.
os.environ.setdefault("ANTHROPIC_API_KEY", "docs-build-placeholder")

# ---------------------------------------------------------------------------
# Project information
# ---------------------------------------------------------------------------
project = "AI Agent MVP"
author = "Ben Wang"
copyright = "2026, Ben Wang"
release = "0.1.0"

# ---------------------------------------------------------------------------
# General configuration
# ---------------------------------------------------------------------------
extensions = [
    "sphinx.ext.autodoc",       # Pull docstrings from source
    "sphinx.ext.napoleon",      # Google / NumPy style docstrings
    "sphinx.ext.viewcode",      # Add [source] links to rendered HTML
    "sphinx.ext.intersphinx",   # Cross-link to Python std-lib docs
    "sphinx_autodoc_typehints", # Render type annotations in descriptions
]

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

# ---------------------------------------------------------------------------
# Autodoc settings
# ---------------------------------------------------------------------------
autodoc_typehints = "description"        # Put types in the description block
autodoc_member_order = "bysource"        # Keep source-file ordering
autodoc_default_options = {
    "members": True,
    "undoc-members": True,
    "show-inheritance": True,
}

# ---------------------------------------------------------------------------
# Napoleon (docstring style)
# ---------------------------------------------------------------------------
napoleon_google_docstring = True
napoleon_numpy_docstring = False
napoleon_include_init_with_doc = True

# ---------------------------------------------------------------------------
# Intersphinx — link to Python standard library
# ---------------------------------------------------------------------------
intersphinx_mapping = {
    "python": ("https://docs.python.org/3", None),
}

# ---------------------------------------------------------------------------
# HTML output
# ---------------------------------------------------------------------------
html_theme = "furo"
html_static_path = ["_static"]
html_title = f"{project} {release}"

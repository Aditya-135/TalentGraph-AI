"""
utils/pdf_parser.py
─────────────────────────
Robust PDF text extraction using PyMuPDF (fitz).
Takes a byte stream from FastAPI UploadFile and returns clean text.
"""
import fitz  # PyMuPDF
import logging
import re

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_bytes: bytes) -> str | None:
    """
    Extracts and cleans text from a PDF byte stream.
    Returns None if parsing fails or text is too short.
    """
    try:
        text = ""
        # Open the PDF directly from the memory byte stream
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                page_text = page.get_text("text")
                if page_text:
                    text += page_text + "\n"

        # Clean the text: remove excessive blank lines and trailing spaces
        clean_text = re.sub(r'\n+', '\n', text).strip()

        # Validation: Ensure the PDF actually contained readable text
        if not clean_text or len(clean_text) < 50:
            logger.error("[PDF_PARSER] Extraction failed: PDF is empty or mostly image-based.")
            return None

        logger.info(f"[PDF_PARSER] Successfully extracted {len(clean_text)} characters.")
        return clean_text

    except fitz.FileDataError:
        logger.error("[PDF_PARSER] Corrupted or invalid PDF file provided.")
        return None
    except Exception as e:
        logger.error(f"[PDF_PARSER] Unexpected exception during parsing: {e}")
        return None
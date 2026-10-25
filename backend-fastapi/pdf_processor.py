import fitz  # PyMuPDF
from typing import List, Dict, Any

def extract_pdf_pages(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extracts text from each page of a PDF with metadata.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text("text").strip()
        pages.append({
            "page_number": page_num + 1,
            "text": text if text else f"[Scanned/Image Content on Page {page_num + 1}]"
        })
    return pages

def chunk_pages(doc_id: str, doc_name: str, pages: List[Dict[str, Any]], chunk_size: int = 350) -> List[Dict[str, Any]]:
    """
    Splits extracted pages into overlapping chunks for vector embedding.
    """
    chunks = []
    chunk_idx = 1
    for p in pages:
        words = p["text"].split()
        if not words:
            continue
        for i in range(0, len(words), chunk_size - 60):
            chunk_words = words[i:i + chunk_size]
            chunks.append({
                "id": f"chk_{doc_id}_{chunk_idx}",
                "document_id": doc_id,
                "document_name": doc_name,
                "page_number": p["page_number"],
                "text": " ".join(chunk_words)
            })
            chunk_idx += 1
    return chunks

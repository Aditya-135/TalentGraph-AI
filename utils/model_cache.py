"""
utils/model_cache.py
Singleton pattern for loading the SentenceTransformer model.
"""
from sentence_transformers import SentenceTransformer
from config import MODEL_NAME

_shared_model = None

def get_shared_model() -> SentenceTransformer:
    global _shared_model
    if _shared_model is None:
        _shared_model = SentenceTransformer(MODEL_NAME)
    return _shared_model
"""
utils/spacy_extractor.py
─────────────────────────
NLP extraction module using spaCy.
Dynamically combines a base lexicon with user-defined job skills.
"""
import spacy
import logging
import re

logger = logging.getLogger(__name__)

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.error("spaCy model 'en_core_web_sm' not found.")
    nlp = None

# Base lexicon (Common stuff we always want to extract if present)
BASE_TECH_SKILLS = {
    "python", "java", "c++", "sql", "fastapi", "django", "react", "docker", "aws", "git"
}

def extract_all(text: str, custom_target_skills: list = None) -> dict:
    """
    Extracts skills using a base list PLUS any custom skills requested by the user.
    Also extracts email, phone, and basic education info.
    """
    if not text or not nlp:
        return {"skills": "", "email": "Not specified", "phone": "Not specified", "education": []}

    # Extract Contact Info
    email_match = re.search(r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', text)
    email = email_match.group(1) if email_match else "Not specified"
    
    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else "Not specified"

    # 1. Dynamically build our search vocabulary for this specific request
    search_vocabulary = set(BASE_TECH_SKILLS)
    if custom_target_skills:
        for skill in custom_target_skills:
            search_vocabulary.add(skill.strip().lower())

    # Create doc on original text to preserve cases for UI but lowercase for matching
    doc = nlp(text)
    extracted_skills = set()
    education_mentions = set()
    edu_keywords = {"university", "college", "institute", "bachelor", "master", "phd", "b.s", "b.a", "m.s", "m.a", "degree"}

    # 2. Check tokens
    for token in doc:
        t_low = token.text.lower()
        if t_low in search_vocabulary:
            extracted_skills.add(t_low)
            
    # 3. Check multi-word phrases
    for chunk in doc.noun_chunks:
        chunk_text_lower = chunk.text.lower()
        if chunk_text_lower in search_vocabulary:
            extracted_skills.add(chunk_text_lower)
        
        # Look for education
        if any(kw in chunk_text_lower for kw in edu_keywords):
            education_mentions.add(chunk.text.title())

    skills_string = ", ".join(extracted_skills)
    logger.info(f"[SPACY] Extracted list: {skills_string}")
    
    edu_list = list(education_mentions)[:4]
    if not edu_list:
        edu_list = ["No formal education matched"]
        
    return {
        "skills": skills_string,
        "email": email,
        "phone": phone,
        "education": edu_list
    }
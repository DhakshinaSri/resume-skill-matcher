import pdfplumber
from sentence_transformers import SentenceTransformer, util
import re


model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(file) -> str: # type: ignore
    with pdfplumber.open(file) as pdf: # type: ignore
        return " ".join(page.extract_text() or "" for page in pdf.pages)

def extract_resume_text(file, filename: str) -> str: # type: ignore
    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file) # type: ignore

    else:
        raise ValueError("Unsupported file format")

def fuzzy_skill_match(resume_text: str, required_skills: list): # type: ignore
    # Split on periods or newlines for better sentence coverage
    resume_sentences = re.split(r'[.\n]', resume_text)
    resume_sentences = [sentence.strip() for sentence in resume_sentences if sentence.strip()]
    
    resume_embeddings = model.encode(resume_sentences, convert_to_tensor=True) # type: ignore

    matched_skills = []
    missing_skills = []

    for skill in required_skills: # type: ignore
        skill_embedding = model.encode(skill, convert_to_tensor=True) # type: ignore
        similarity = util.cos_sim(skill_embedding, resume_embeddings).max().item() # type: ignore
        print(f"Skill: {skill} | Similarity: {similarity}")  # Debugging output

        if similarity > 0.45:  # Lowered threshold for better fuzzy matching
            matched_skills.append(skill) # type: ignore
        else:
            missing_skills.append(skill) # type: ignore

    score = round(len(matched_skills) / len(required_skills) * 100, 2) # type: ignore
    return matched_skills, missing_skills, score # type: ignore
from fastapi import FastAPI, UploadFile, Form 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from utils import extract_resume_text, fuzzy_skill_match  # type: ignore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/match_resume/")
async def match_resume(file: UploadFile, required_skills: str = Form(...)):
    try:
        print("Received file:", file.filename)
        print("Required skills:", required_skills)
        resume_text = extract_resume_text(file.file, file.filename) # type: ignore
        print("Extracted resume text length:", len(resume_text)) # type: ignore
        skills_list = [skill.strip() for skill in required_skills.split(",") if skill.strip()]
        matched, missing, score = fuzzy_skill_match(resume_text, skills_list) # type: ignore
        print("Matched:", matched) # type: ignore
        print("Missing:", missing) # type: ignore
        return JSONResponse({
            "match_score": score,
            "matched_skills": matched,
            "missing_skills": missing
        })
    except Exception as e:
        print("Error:", e)
        return JSONResponse(status_code=400, content={"error": str(e)})

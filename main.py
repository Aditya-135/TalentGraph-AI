"""
main.py
FastAPI entry point for the c2p2 Graph Reasoning architecture.
Includes PDF upload, spaCy extraction, and Graph Traversal.
"""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import traceback

from agents.graph_builder import DynamicKnowledgeGraph
from agents.graph_reasoning import GraphReasoningEngine
from agents.xai_explainer import GraphXAI

from utils.pdf_parser import extract_text_from_pdf
from utils.spacy_extractor import extract_all

app = FastAPI(title="c2p2 Graph Reasoning System", version="2.0")

# Mount the frontend directory so FastAPI serves your CSS and JS
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

@app.get("/")
async def serve_ui():
    """Serves your new dark-mode index.html"""
    return FileResponse("frontend/index.html")

@app.get("/health")
async def health_check():
    """Health check endpoint for API connection status."""
    return {"status": "ok"}

@app.post("/upload_and_analyze_graph")
async def upload_and_analyze_graph(
    candidate_name: str = Form(...),
    job_title: str = Form(...),
    job_skills_input: str = Form(...), # Comma-separated string from the UI
    resume_file: UploadFile = File(...)
):
    try:
        # 1. Parse PDF
        if resume_file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
            
        file_bytes = await resume_file.read()
        resume_text = extract_text_from_pdf(file_bytes)

        if not resume_text or len(resume_text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        job_skills_list = [s.strip() for s in job_skills_input.split(",") if s.strip()]

        # 2. Extract Skills using your spaCy extractor
        extracted_data = extract_all(resume_text, custom_target_skills=job_skills_list)
        candidate_skills_raw = extracted_data.get("skills", "")
        
        # Convert strings to lists for the Graph Builder
        candidate_skills_list = [s.strip() for s in candidate_skills_raw.split(",") if s.strip()]

        # 3. Initialize Graph Agents
        kg_builder = DynamicKnowledgeGraph()
        reasoning_engine = GraphReasoningEngine()
        xai = GraphXAI()

        # 4. Build Knowledge Graphs
        candidate_graph = kg_builder.build_resume_graph(candidate_name, candidate_skills_list)
        job_graph = kg_builder.build_job_graph(job_title, job_skills_list)

        # 5. Execute Graph-Based Reasoning
        alignment_score, matched, missing = reasoning_engine.compute_structural_alignment(
            source_graph=candidate_graph,
            target_graph=job_graph,
            source_root=candidate_name,
            target_root=job_title
        )

        # 6. Generate Explainable AI (XAI) Output
        xai_report = xai.generate_explanation(
            source_name=candidate_name,
            alignment_score=alignment_score,
            matched=matched,
            missing=missing
        )

        # 7. Return data formatted for your new UI
        return {
            "status": "success",
            "candidate": candidate_name,
            "extracted_skills": candidate_skills_list,
            "email": extracted_data.get("email"),
            "phone": extracted_data.get("phone"),
            "education": extracted_data.get("education"),
            "metrics": {
                "structural_alignment_score": alignment_score,
            },
            "explainability": xai_report
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
# TalentGraph-AI  
### Explainable Knowledge Graph-Based Recruitment Intelligence System

TalentGraph-AI is an advanced AI-powered recruitment intelligence system that combines **Natural Language Processing (NLP)**, **Knowledge Graph Reasoning**, and **Explainable AI (XAI)** to intelligently analyze resumes and job descriptions.

Unlike traditional Applicant Tracking Systems (ATS) that rely heavily on keyword matching, TalentGraph-AI builds structured knowledge graphs from candidate profiles and job requirements to perform deeper reasoning, transparent evaluation, and intelligent candidate-job alignment.

---

# 🚀 Key Features

## ✅ Resume Parsing
- Extracts text from PDF resumes
- Supports structured resume analysis
- Handles skill and experience extraction

## ✅ NLP-Based Skill Extraction
- Uses spaCy NLP pipeline
- Identifies technical skills and keywords
- Processes semantic entities from resumes and job descriptions

## ✅ Knowledge Graph Construction
- Converts extracted information into graph structures
- Represents skills, technologies, and relationships as nodes and edges
- Enables structural reasoning instead of plain keyword comparison

## ✅ Graph-Based Candidate Matching
- Performs intelligent graph alignment between:
  - Candidate profile graph
  - Job requirement graph
- Computes similarity and compatibility scores

## ✅ Explainable AI (XAI)
- Provides transparent reasoning for decisions
- Displays:
  - Matched skills
  - Missing skills
  - Compatibility insights
  - Recruitment explanations

## ✅ Interactive Visualization
- Dynamic frontend interface
- Graph visualization support
- Modern dark-themed UI
- Real-time API interaction

---

# 🧠 System Architecture

```text
PDF Resume
    ↓
Text Extraction
    ↓
NLP Skill Extraction
    ↓
Knowledge Graph Builder
    ↓
Graph Reasoning Engine
    ↓
Similarity & Alignment Scoring
    ↓
Explainable AI Layer
    ↓
Frontend Visualization
```

---

# 🛠️ Tech Stack

## Backend
- Python
- FastAPI
- NetworkX
- spaCy
- PyMuPDF

## Frontend
- HTML
- CSS
- JavaScript

## AI / NLP
- Knowledge Graphs
- NLP Skill Extraction
- Explainable AI (XAI)
- Graph-Based Reasoning

---

# 📂 Project Structure

```bash
TalentGraph-AI/
│
├── agents/
│   ├── graph_builder.py
│   ├── graph_reasoning.py
│   └── xai_explainer.py
│
├── utils/
│   ├── pdf_parser.py
│   ├── spacy_extractor.py
│   └── model_cache.py
│
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── main.py
├── config.py
├── requirements.txt
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Aditya-135/TalentGraph-AI.git
cd TalentGraph-AI
```

---

## 2️⃣ Create Virtual Environment

### Windows
```bash
python -m venv venv
venv\\Scripts\\activate
```

### Linux / macOS
```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4️⃣ Download spaCy Model

```bash
python -m spacy download en_core_web_sm
```

---

# ▶️ Running the Project

## Start FastAPI Backend

```bash
uvicorn main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

---

## Open Frontend

Open:

```text
frontend/index.html
```

in your browser.

---

# 📊 Example Workflow

1. Upload resume PDF
2. Enter job description
3. Extract skills using NLP
4. Build knowledge graphs
5. Perform graph reasoning
6. Generate compatibility score
7. Display explainable hiring insights

---

# 🔍 Explainable AI Output

TalentGraph-AI provides transparent recruitment insights such as:

- Matching Skills
- Missing Skills
- Candidate Strengths
- Compatibility Score
- Graph Alignment Insights
- Recommendation Reasoning

---

# 🎯 Research Contribution

TalentGraph-AI explores the integration of:

- Explainable AI (XAI)
- Knowledge Graphs
- NLP-Based Recruitment Intelligence
- Graph Reasoning Systems
- Transparent AI Decision-Making

This project aims to improve fairness, interpretability, and intelligence in modern recruitment systems.

---

# 📈 Future Enhancements

- Semantic similarity using Sentence Transformers
- Graph Neural Networks (GNNs)
- Neo4j Graph Database Integration
- Multi-candidate ranking system
- Recruiter analytics dashboard
- Adaptive learning-based scoring
- Bias detection and fairness evaluation
- Cloud deployment support

---

# 📚 Research Domains

- Artificial Intelligence
- Explainable AI (XAI)
- Natural Language Processing (NLP)
- Knowledge Graphs
- Intelligent Recruitment Systems
- Decision Intelligence

---

# 👨‍💻 Author

**Aditya**

AI/ML Research & Intelligent Systems Development

---

# 📄 License

This project is intended for academic, research, and educational purposes.

---

# ⭐ TalentGraph-AI

### Intelligent • Explainable • Graph-Based Recruitment Intelligence

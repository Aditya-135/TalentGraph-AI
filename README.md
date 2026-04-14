# C2P2 Graph Reasoning System

An AI-powered resume-to-job matching platform that uses **Knowledge Graphs**, **Structural Alignment**, and **Explainable AI (XAI)** to evaluate candidate suitability against job requirements.

---

## Overview

Traditional resume screening often relies on keyword matching, which can miss context and structural relationships between skills and job requirements.

The **C2P2 Graph Reasoning System** addresses this by:

* Extracting candidate skills from uploaded resumes (PDF)
* Building directed knowledge graphs for candidates and jobs
* Comparing graph structures using reasoning algorithms
* Generating alignment scores
* Producing transparent hiring decisions with XAI explanations
* Visualizing matched and missing concepts in an interactive UI

---

## Core Features

### Resume Parsing

* Upload candidate resumes in PDF format
* Extract readable text content
* Detect contact information (email, phone)
* Identify education mentions

### Skill Extraction

* NLP-based extraction using spaCy
* Base technical skill lexicon
* Dynamic support for custom job-required skills

### Knowledge Graph Engine

* Candidate → Skills graph
* Job → Required Skills graph
* Directed graph architecture using NetworkX

### Graph Reasoning

* Traverses graph nodes
* Finds matched required concepts
* Detects missing requirements
* Calculates structural alignment score

### Explainable AI (XAI)

Decision categories:

* `AUTO_ACCEPT`
* `REVIEW_REQUIRED`
* `BLOCK_AUTOMATION`

Each decision includes human-readable reasoning.

### Interactive Frontend

* Modern dark UI
* Drag & drop PDF upload
* Skill chip input system
* Visual score ring
* Graph visualization
* Export graph as SVG / PNG

---

## Tech Stack

### Backend

* Python
* FastAPI
* NetworkX
* spaCy
* PyMuPDF

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)

### AI / Logic

* NLP Skill Extraction
* Knowledge Graph Reasoning
* Explainable AI

---

## Project Structure

```text
c2p2_graph_reasoning/
│── main.py
│── config.py
│── requirements.txt
│── generate_patent_diagram.py
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
└── frontend/
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── api.js
        └── app.js
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Aditya-135/c2p2_graph_reasoning.git
cd c2p2_graph_reasoning
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / Mac

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

---

## Run the Project

```bash
uvicorn main:app --reload
```

Open in browser:

```text
http://127.0.0.1:8000
```

---

## Workflow

1. Enter candidate name
2. Enter job title
3. Upload resume PDF
4. Add required job skills
5. Run graph analysis
6. View:

   * Alignment score
   * Matched skills
   * Missing skills
   * XAI decision
   * Graph visualization

---

## Example Decisions

| Score Range | Decision         |
| ----------- | ---------------- |
| 75%+        | AUTO_ACCEPT      |
| 40% - 74%   | REVIEW_REQUIRED  |
| Below 40%   | BLOCK_AUTOMATION |

---

## Use Cases

* Smart ATS systems
* HR automation
* Resume screening
* Recruitment analytics
* Candidate ranking
* Transparent AI hiring systems

---

## Future Enhancements

* Semantic similarity matching
* Multi-resume ranking
* Recruiter dashboard
* Authentication system
* Cloud deployment
* Real-time analytics
* LLM-assisted reasoning layer

---

## Research Value

This project demonstrates practical application of:

* Artificial Intelligence
* Graph Theory
* NLP
* Explainable AI
* Decision Systems
* Human-Centered AI

---

## Author

**Aditya Patil**
**Saloni Bhimellu**

B.Tech CSE (AI & ML)

---

## License

This project is for academic, research, and innovation purposes.

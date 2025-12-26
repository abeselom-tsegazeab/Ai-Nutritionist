# ai-nutritionist-capstone

## Project Setup
- Python backend (FastAPI)
- Frontend (React)
- LLM fine-tuning (TinyLLaMA / GPT-OSS)
- Documentation following capstone guide

## Folder Structure
ai-nutritionist-capstone/
│
├── backend/
│   ├── main.py
│   │
│   ├── routers/
│   │     ├── auth.py
│   │     ├── mealplan.py
│   │     └── pdf.py
│   │
│   ├── core/
│   │     ├── security.py
│   │     └── config.py
│   │
│   ├── database/
│   │     ├── database.py   
│   │     ├── models.py       
│   │     └── schemas.py      
│   │
│   ├── ai/
│   │     └── generator.py
│   │
│   └── requirements.txt
│
├── frontend/
│
├── ai-model/
│   ├── dataset/
│   ├── training/
│   └── inference/
│
└── docs/




🧠 1. The Gemini System Prompt (The Logic)
To get consistent JSON from Gemini that your Python code can actually execute, you need a high-pressure system prompt.
# server/app/core/prompts.py

SYSTEM_PROMPT = """
You are an AI Data Engineer. Your goal is to convert a user's ML data request into a Python-executable cleaning plan.

User Request: {user_input}
Dataset Columns: {columns}

Return ONLY a JSON object with this exact structure:
{{
  "actions": {{
    "drop_columns": ["list", "of", "unnecessary", "cols"],
    "rename_columns": {{"old_name": "new_name"}},
    "target_column": "the_label_column",
    "handle_nulls": "drop" | "fill_mean" | "fill_median",
    "categorical_encoding": "one_hot" | "label",
    "text_cleaning": ["lowercase", "remove_punctuation"]
  }},
  "metadata": {{
    "estimated_quality_score": 0-100,
    "rationale": "short explanation of why these steps were chosen"
  }}
}}
"""

🏗️ 2. The FastAPI Backend Boilerplate
This structure handles the file lifecycle: Upload/Fetch → Process → Download.
# server/main.py
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import FileResponse
import os
import uuid

app = FastAPI()

# Temporary directory for processed files
STORAGE_DIR = "./temp_data"
os.makedirs(STORAGE_DIR, exist_ok=True)

@app.post("/process-data")
async def process_data(job_id: str, background_tasks: BackgroundTasks):
    """
    Kicks off the Pandas cleaning in the background 
    so the UI doesn't hang.
    """
    output_filename = f"{job_id}_cleaned.csv"
    output_path = os.path.join(STORAGE_DIR, output_filename)
    
    # background_tasks.add_task(run_cleaning_pipeline, job_id, output_path)
    
    return {"message": "Processing started", "job_id": job_id}

@app.get("/download/{job_id}")
async def download_file(job_id: str):
    file_path = f"{STORAGE_DIR}/{job_id}_cleaned.csv"
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path, 
            filename="stratix_export.csv", 
            media_type="text/csv"
        )
    return {"error": "File not found or still processing"}

🧪 3. The "Mock-First" Implementation (Hackathon Strategy)
To ensure you have a working demo by the deadline, implement your dataset_service.py like this:
# server/app/core/dataset_service.py

async def search_datasets(query: str):
    """
    Try to fetch from HuggingFace, but fallback to local 
    files if the network is slow or API fails.
    """
    try:
        # Real logic: return hf_api.list_datasets(filter=query)
        pass
    except Exception:
        # Mock logic for the demo
        return [
            {"id": "mock_1", "name": "Twitter Sentiment Mini", "source": "Local"},
            {"id": "mock_2", "name": "Customer Churn Data", "source": "Local"}
        ]

🏁 Final Step for Success
To win the hackathon, your UI must show what is happening behind the scenes. When the user clicks "Process," show the Gemini-generated JSON in a "Developer Logs" console on the side. Judges love seeing the AI's "thought process."

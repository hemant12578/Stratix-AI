📂 1. Project Structure (Monorepo)
stratix-ai/
├── client/                # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/    # UI (Search, Progress, Preview)
│   │   ├── hooks/         # API interaction logic
│   │   └── pages/         # Landing, Dashboard, Results
├── server/                # FastAPI + Python
│   ├── app/
│   │   ├── api/           # Endpoints (search, process, download)
│   │   ├── core/          # Gemini & Data Services
│   │   ├── models/        # Pydantic schemas for Gemini JSON
│   │   └── utils/         # Data cleaning logic (Pandas)
│   └── main.py            # Entry point
└── data/                  # Local temp storage for processed files

🛠️ 2. Core Service Logic
Step A: The Gemini "Synthesizer"
Instead of a simple prompt, we use Gemini’s Structured Output to ensure the backend receives a valid Python dictionary every time.
# server/app/core/gemini_service.py
import google.generativeai as genai
from pydantic import BaseModel

class DataRequirement(BaseModel):
    task: str
    target_col: str
    format: str
    suggested_cleaning: list[str]

def analyze_requirement(user_input: str) -> DataRequirement:
    model = genai.GenerativeModel('gemini-1.5-flash')
    # Use response_mime_type to force JSON output
    response = model.generate_content(
        f"Analyze this ML data request: {user_input}",
        generation_config={"response_mime_type": "application/json"}
    )
    return DataRequirement.model_validate_json(response.text)

Step B: The Automated Cleaner (The "Processor")
The AI identifies the problems; Pandas executes the solutions.
# server/app/core/processor.py
import pandas as pd

def clean_dataset(file_path: str, instructions: DataRequirement):
    df = pd.read_csv(file_path)
    
    # Standard Hackathon Cleaning Logic
    df = df.drop_duplicates()
    df = df.dropna(subset=[instructions.target_col]) # Critical for ML
    
    # Feature Engineering (if suggested)
    if "lowercase" in instructions.suggested_cleaning:
        text_cols = df.select_dtypes(include=['object']).columns
        for col in text_cols:
            df[col] = df[col].str.lower()
            
    return df

🚀 3. Hackathon Integration Strategy
Data Source Shortcuts
 * HuggingFace: Use the datasets library. It’s faster than Kaggle for an MVP because it doesn't require complex authentication for public data.
 * Mocking: If an API fails during the demo, have a "Seed" folder with 3 popular datasets (Titanic, Twitter Sentiment, Iris) so the UI always has something to show.
The "Live Progress" Trick
To make the 60-second processing time feel fast, use Server-Sent Events (SSE) or a simple status polling mechanism in FastAPI.
 * Status 1: "Gemini is dreaming up your schema..."
 * Status 2: "Downloading 50k samples from HuggingFace..."
 * Status 3: "Scrubbing null values and encoding labels..."
📋 4. Verification Checklist
| Phase | Test Case | Success Criteria |
|---|---|---|
| Input | Query: "Spam detection for SMS" | Gemini returns task: classification. |
| Search | Trigger Fetch | List showing "UCI SMS Spam Collection" appears. |
| Process | Click "Clean Data" | A .zip file is generated in /data/temp. |
| Export | Open CSV | No nulls in the label column; column names are standardized. |

🛠️ 1. Backend: The "Brain" (FastAPI)
We will use a Task-Based Pattern. Since data processing can take 30+ seconds, we don't want the frontend to time out.
A. Requirement Analysis Route
This endpoint takes the user's plain English and returns the structured "Blueprint."
# server/app/api/analyze.py
from fastapi import APIRouter
from app.core.gemini_service import analyze_requirement

router = APIRouter()

@router.post("/analyze")
async def get_blueprint(user_query: str):
    # Gemini returns JSON with domain, task_type, and cleaning_steps
    blueprint = analyze_requirement(user_query)
    return {"status": "success", "data": blueprint}

B. The Data Engine (Pandas + Gemini)
This is where the magic happens. Gemini generates the specific cleaning logic, and Pandas executes it safely.
# server/app/core/processor.py
import pandas as pd
import io

class DataProcessor:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def apply_cleaning(self, instructions: dict):
        """
        Instructions format: 
        {"remove_cols": ["id"], "rename": {"old": "new"}, "handle_nulls": "drop"}
        """
        # 1. Drop Irrelevant Columns
        if instructions.get("remove_cols"):
            self.df.drop(columns=instructions["remove_cols"], inplace=True, errors='ignore')
        
        # 2. Handle Missing Values
        if instructions.get("handle_nulls") == "drop":
            self.df.dropna(inplace=True)
        elif instructions.get("handle_nulls") == "fill_mean":
            self.df.fillna(self.df.mean(numeric_only=True), inplace=True)

        # 3. Standardize text
        text_cols = self.df.select_dtypes(include=['object']).columns
        for col in text_cols:
            self.df[col] = self.df[col].astype(str).str.lower().str.strip()

        return self.df

🎨 2. Frontend: The "Interface" (React)
You need a high-end "Processing" state to keep users engaged. Use a Stepper Component to show what the AI is doing.
The "Live Progress" Component
// client/src/components/ProcessingStatus.jsx
const steps = [
  "Analyzing requirements with Gemini...",
  "Searching Kaggle & HuggingFace...",
  "Downloading raw datasets...",
  "Cleaning and formatting...",
  "Generating ML training code..."
];

export function ProcessingStatus({ currentStep }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className={`h-4 w-4 rounded-full ${index <= currentStep ? 'bg-green-500 animate-pulse' : 'bg-gray-700'}`} />
          <p className={index <= currentStep ? 'text-white' : 'text-gray-500'}>{step}</p>
        </div>
      ))}
    </div>
  );
}

🗄️ 3. Database Schema (Supabase)
Even for a hackathon, you need to persist the "Jobs" so users can refresh the page without losing their download.
| Table: jobs | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| user_query | Text | The original prompt |
| status | Enum | analyzing, fetching, processing, completed |
| file_url | Text | Link to the generated CSV/ZIP |
| metadata | JSONB | Column names, row count, quality score |
⚡ 4. The "Hackathon Speed" Strategy
To finish this in a weekend, follow this sequence:
 * Mock the Data Source: Don't spend 5 hours fighting with the Kaggle API. Create a folder called sample_data/ with 5 common CSVs (Sentiment, Housing, Iris, Titanic, MNIST).
 * Hardcode the Search: If the user types "Sentiment", map it to your sentiment.csv.
 * Focus on the Transformation: Use Gemini to "decide" which columns to keep/drop from your mock CSV. This proves the core concept (AI-driven ETL) without the flaky external API calls.

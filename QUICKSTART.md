# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo GEMINI_API_KEY=your_key_here > .env

# Run server
python main.py
```

Server will start on `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:5173`

### 3. Get Your Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it to `server/.env` file

### 4. Test the Application

1. Open `http://localhost:5173` in your browser
2. Try searching: "I need sentiment analysis data with 50k samples"
3. Select a dataset
4. Process and download!

## 🎯 Example Queries

- "I need sentiment analysis data with 50k samples, positive/negative labels"
- "Spam detection dataset for SMS messages"
- "Housing price prediction data"
- "Iris flower classification dataset"
- "Titanic survival prediction data"

## ⚠️ Troubleshooting

### Backend won't start
- Check if port 8000 is available
- Verify Python version (3.9+)
- Ensure all dependencies are installed

### Frontend won't start
- Check if port 5173 is available
- Verify Node.js version (18+)
- Run `npm install` again

### Gemini API errors
- Verify your API key is correct
- Check API quota/limits
- Ensure internet connection

### No datasets found
- The app uses mock datasets if real APIs fail
- Check console for errors
- Verify backend is running

## 📝 Next Steps

- Add more data sources (Kaggle API)
- Implement user authentication
- Add payment integration
- Deploy to production
